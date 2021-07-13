'use strict';

const path = require('path');
const semver = require('semver');
const colors = require('colors/safe');
const userHome = require('user-home');
const pathExists = require('path-exists');
const log = require('@noodlespro/log');

const pkg = require('../package.json');
const constant = require('./const');
const { Command } = require('commander');
const exec = require('@noodlespro/exec');

const program = new Command();

async function core() {
  log.success('test', 'success...');
  log.verbose('debug', 'debug...');
  try {
    await prepare();
    registerCommand();
  } catch (error) {
    log.error(error.message);
  }
}

async function prepare() {
  checkPkgVersion();
  checkRoot();
  checkUserHome();
  checkEnv();
  await checkGloalUpdate();
}

function checkPkgVersion() {
  log.notice('cli', pkg.version);
}

function checkRoot() {
  const rootCheck = require('root-check');
  rootCheck();
}

function checkUserHome() {
  if (!userHome || !pathExists(userHome)) {
    throw new Error(colors.red(`当前登陆用户主目录不存在！`));
  }
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
  const lastVersion = await getNpmSemverVersion(currentVersion, npmName);

  if (lastVersion && semver.gt(currentVersion, lastVersion)) {
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

function registerCommand() {
  program
    .name(Object.keys(pkg.bin)[0])
    .usage('<command> [options]')
    .version(pkg.version)
    .option('-d, --debug', '是否开启调试模式', false)
    .option('-t, --targetPath <targetPath>', '是否开启本地调试文件路径', '');

  program
    .command('init [projectName]')
    .option('-f, --force', '是否强制初始化项目')
    .action(exec);

  //开启debug模式
  program.on('option:debug', function () {
    const options = program.opts();
    if (options.debug) {
      process.env.LOG_LEVEL = 'verbose';
    } else {
      process.env.LOG_LEVEL = 'info';
    }
    log.level = process.env.LOG_LEVEL;
    log.verbose('test');
  });

  //指定targetPath
  program.on('option:targetPath', function () {
    process.env.CLI_TARGET_PATH = program.opts().targetPath;
  });

  //对未知命令监听
  program.on('command:*', function (obj) {
    const availableCommands = program.commands.map(cmd => cmd.name());
    console.log(colors.red('未知的命令' + obj[0]));
    if (availableCommands.length > 0) {
      console.log(colors.red('可用命令' + availableCommands.join(',')));
    }
  });

  if (program._args && program._args < 1) {
    program.outputHelp();
  }

  program.parse(process.argv);
}

module.exports = core;
