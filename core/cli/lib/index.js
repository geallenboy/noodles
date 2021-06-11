'use strict';

module.exports = core;
const path = require('path');
const semver = require('semver');
const colors = require('colors/safe');
const userHome = require('user-home');
const pathExists = require('path-exists');
const log = require('@noodlespro/log');
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
    checkInputArgs();
    checkEnv();
    log.verbose('debug', 'test debug log');
  } catch (error) {
    log.error(error.message);
  }
}

function checkInputArgs() {
  const minimist = require('minimist');
  const argv = minimist(process.argv.slice(2));
  console.log(argv);
  if (argv.debug) {
    process.env.LOG_LEVEL = 'verbose';
  } else {
    process.env.LOG_LEVEL = 'info';
  }
  log.level = process.env.LOG_LEVEL;
}

function checkPkgVersion() {
  log.notice('cli', pkg.version);
}

function checkNodeVersion() {
  //1.获取当前node版本号
  const currentVersion = process.version;
  //2.比较node最低版本号
  const lowestVersion = constant.LOWEST_NODE_VERSION;
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

function checkEnv() {
  let config;
  const dotenv = require('dotenv');
  const dotenvPath = path.resolve(userHome, '.env');
  if (pathExists(dotenvPath)) {
    config = dotenv.config({
      path: dotenvPath,
    });
  }
  const cliConfig = {
    home: userHome,
  };
  if (process.env.CLI_HOME) {
    cliConfig['cliHome'] = path.join(userHome, process.env.CLI_HOME);
  } else {
    cliConfig['cliHome'] = path.join(userHome, constant.DEFAULT_CLI_HOME);
  }
  process.env.CLI_HOME_PATH = cliConfig.cliHome;
  log.verbose('环境变量', process.env.CLI_HOME_PATH);
}
