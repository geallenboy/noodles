'use strict';
const path = require('path');
const pkgDir = require('pkg-dir').sync;
const { isObject } = require('@noodlespro/help');
const npminstall = require('npminstall');
const fse = require('fs-extra');
const formatPath = require('@noodlespro/format-path');
const pathExists = require('path-exists').sync;
const {
  getDefaultRegistry,
  getNpmLatestVersion,
} = require('@noodlespro/npm-info');

class Package {
  constructor(options) {
    if (!options && !isObject(options)) {
      throw new Error('package类的options参数不能为空！');
    }

    //package的目标路径
    this.targetPath = options.targetPath;
    //package的缓存路径
    this.storeDir = options.storeDir;
    //package的name
    this.packageName = options.packageName;
    //package的版本
    this.packageVersion = options.packageVersion;
    //package的缓存目录前缀
    this.cacheFilePathPrefix = this.packageName.replace('/', '_');
  }
  async prepare() {
    if (this.storeDir && !pathExists(this.storeDir)) {
      fse.mkdirpSync(this.storeDir);
    }
    if (this.packageVersion === 'latest') {
      this.packageVersion = await getNpmLatestVersion(this.packageName);
    }
  }
  //获取缓存文件路径
  get cacheFilePath() {
    return path.resolve(
      this.storeDir,
      `_${this.cacheFilePathPrefix}@${this.packageVersion}@${this.packageName}`
    );
  }
  //获取最新缓存文件路径
  getSpecificCacheFilePath(packageVersion) {
    return path.resolve(
      this.storeDir,
      `_${this.cacheFilePathPrefix}@${packageVersion}@${this.packageName}`
    );
  }

  //判断当前package是否存在
  async exists() {
    if (this.storeDir) {
      await this.prepare();

      return pathExists(this.cacheFilePath);
    } else {
      return pathExists(this.targetPath);
    }
  }
  //安装
  async install() {
    await this.prepare();
    return npminstall({
      root: this.targetPath,
      storeDir: this.storeDir,
      registry: getDefaultRegistry(),
      pkgs: [{ name: this.packageName, version: this.packageVersion }],
    });
  }

  //更新
  async update() {
    await this.prepare();
    //1.获取最新的npm模块版本号
    const latestPackageVersion = await getNpmLatestVersion(this.packageName);
    //2.查询最新版本号对应的路径是否存在
    const latestFilePath = this.getSpecificCacheFilePath(latestPackageVersion);
    //3.如果不存在，则直接安装最新版本号
    if (!pathExists(latestFilePath)) {
      await npminstall({
        root: this.targetPath,
        storeDir: this.storeDir,
        registry: getDefaultRegistry(),
        pkgs: [{ name: this.packageName, version: this.packageVersion }],
      });
      this.packageVersion = latestPackageVersion;
    }
    return latestFilePath;
  }

  //获取入口文件的路径
  getRootFilePath() {
    function _getRootFile(targetPath) {
      //1.获取package.json路径 -pkg-dir
      const dir = pkgDir(targetPath);
      //2.读取package.json - require() js/json/node
      //3.main/lib - path
      const pkgFile = require(path.resolve(dir, 'package.json'));

      if (pkgFile && pkgFile.main) {
        //4.路径的兼容（macOS/windows）
        return formatPath(path.resolve(dir, pkgFile.main));
      }
    }
    if (this.storeDir) {
      return _getRootFile(this.cacheFilePath);
    } else {
      return _getRootFile(this.targetPath);
    }
  }
}

module.exports = Package;
