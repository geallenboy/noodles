'use strict';

module.exports = core;
const semver = require('semver');
const colors = require('colors/safe');
const userHome = require('user-home');
const pathExists = require('path-exists');
const log = require('@noodles/log');
const pkg = require('../package.json');
const constant = require('./const');

function core() {
  log.success('test', 'success...');
  log.verbose('debug', 'debug...');
  try {
    checkPkgVersion();
    checkNodeVersion();
    checkRoot();
    checkUserHome();
  } catch (error) {
    log.error(error.message);
  }
}

function checkPkgVersion() {
  log.notice('cli', pkg.version);
}

function checkNodeVersion() {
  //1.获取当前node版本号
  const currentVersion = process.version;
  //2.比较node最低版本号
  const lowestVersion = constant.LOWEST_NODE_VERSION;
  console.log(currentVersion, lowestVersion);
  if (!semver.gte(currentVersion, lowestVersion)) {
    throw new Error(
      colors.red(`noodles 需要安装 v${lowestVersion} 以上版本的 Node`)
    );
  }
}

function checkRoot() {
  const rootCheck = require('root-check');
  rootCheck();
  console.log(process.geteuid());
}

function checkUserHome() {
  if (!userHome || !pathExists(userHome)) {
    throw new Error(colors.red(`当前登陆用户主目录不存在！`));
  }
  console.log(userHome);
}
