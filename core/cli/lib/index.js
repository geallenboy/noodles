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

async function core() {
  log.success('test', 'success...');
  log.verbose('debug', 'debug...');
  try {
    checkPkgVersion();
    checkNodeVersion();
    checkRoot();
    checkUserHome();
    checkInputArgs();
    checkEnv();
    await checkGloalUpdate();
    log.verbose('debug', 'test debug log');
  } catch (error) {
    log.error(error.message);
  }
}

function checkInputArgs() {
  const minimist = require('minimist');
  const argv = minimist(process.argv.slice(2));

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
  log.verbose('环境变量', process.env.USER, process.env.CLI_HOME_PATH);
}

async function checkGloalUpdate() {
  //1.获取当前的版本号和模块名
  const currentVersion = pkg.version;
  const npmName = pkg.name;
  //2.调用npm api 获取所有版本号
  const { getNpmSemverVersion } = require('@noodlespro/npm-info');
  const lastVersion = await getNpmSemverVersion('1.0.5', npmName);
  console.log(lastVersion);
  if (lastVersion && semver.gt(lastVersion, currentVersion)) {
    log.warn(
      colors.yellow(
        '更新提示',
        `请手动更新${npmName}，当前版本：${currentVersion},最新版本：${lastVersion}
  更新命令：npm install -g ${npmName}`
      )
    );
  }
  //3.提取所有的版本号，比对哪些版本号是大于当前版本号

  //4.获取最新的版本号，提示用户更新到该版本
}
