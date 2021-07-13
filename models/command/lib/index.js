'use strict';
const log = require('@noodlespro/log');
const semver = require('semver');
const colors = require('colors/safe');
const LOWEST_NODE_VERSION = '11.5.0';

class Command {
  constructor(argv) {
    if (!argv) {
      throw new Error('参数不能为空！');
    }
    if (!Array.isArray(argv)) {
      throw new Error('参数必须为对象！');
    }
    if (argv.length < 1) {
      throw new Error('参数列表不能为空！');
    }

    this._argv = argv;

    let runner = new Promise((resolve, reject) => {
      let chain = Promise.resolve();
      chain = chain
        .then(() => this.checkNodeVersion())
        .then(() => this.initArgs())
        .then(() => this.init())
        .catch(err => {
          log.error(err.message);
        });
    });
  }
  initArgs() {
    this._cmd = this._argv[this._argv.length - 1];
    this._argv = this._argv.slice(0, this._argv.length - 1);
  }
  checkNodeVersion() {
    //1.获取当前node版本号
    const currentVersion = process.version;
    //2.比较node最低版本号
    const lowestVersion = LOWEST_NODE_VERSION;
    if (!semver.gte(currentVersion, lowestVersion)) {
      throw new Error(
        colors.red(`noodles 需要安装 v${lowestVersion} 以上版本的 Node`)
      );
    }
  }
  init() {
    throw new Error('init必须实现');
  }

  exec() {
    throw new Error('exec必须实现');
  }
}

module.exports = Command;
