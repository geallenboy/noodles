'use strict';
const path = require('path');
const cmder = require('commander');
const chalk = require('chalk');
const inquire = require('inquirer');
const Boilerplate = require('./boilerplate');

module.exports = class Command {
  constructor() {
    this.baseDir = process.cwd();
    this.program = cmder;
    this.inquire = inquire;
    this.chalk = chalk;

    this.commands = ['init', 'dev', 'test', 'start', 'build', 'server'];
    this.boilerplate = new Boilerplate(this);
  }

  version() {
    // const pkg = require(path.resolve(__dirname,'../../package.json'));
    this.program.version('0.0.1', '-v,--version');
  }

  option() {
    this.program
      .option('--webpack', '支持本地webpack开发和构建')
      .option('-f, --filename [path]', 'webpack config file path')
      .option('-p, --port [port]', 'webpack server port')
      .option('-t, --type [type]', 'webpack build type: client, server, web');
  }
  init() {
    this.program
      .command('init')
      .option(
        '-r, --registry [url]',
        'npm registry, default https://registry.npmjs.org, you can taobao registry: https://registry.npm.taobao.org'
      )
      .description('初始化webpack配置,react的样板文件')
      .action(options => {
        console.log('初始化', options);
        // this.boilerplate.init(options);
      });
  }
  install() {
    this.program
      .command('install')
      .option('--mode [mode]', 'mode: npm,yarn')
      .description('动态安装webpack缺少npm模块')
      .action(options => {
        console.log(options);
      });
  }
  dev() {
    this.program
      .command('dev [env]')
      .description('启动webpack dev服务器以进行开发模式')
      .action(options => {
        console.log(options);
      });
  }
  test() {
    this.program
      .command('test')
      .description('单元测')
      .action(options => {
        console.log('test', options);
      });
  }
  start() {
    this.program
      .command('start [env]')
      .description('启动webpack dev服务器以进行开发模式')
      .action(options => {
        console.log('start', options);
      });
  }

  build() {
    this.program
      .command('build [env]')
      .option('--devtool [devtool]', '设置webpack 开发工具')
      .option('--server [port]', '启动http服务器')
      .option('--speed', '统计webpack构件速度')
      .description('打包编译')
      .action(options => {
        console.log(options);
      });
  }
  server() {
    this.program
      .command('server')
      .option('-p, --port [port]', 'http服务器端口')
      .option('-d, --dist [dist]', 'http服务器文件目录')
      .option('-i, --index [index]', 'http服务器html索引文件名')
      .description('静态文件web http服务器')
      .action(options => {
        console.log(options);
      });
  }
  command() {
    this.commands.forEach(cmd => {
      if (this[cmd]) {
        this[cmd].apply(this);
      } else {
        console.log(chalk.red(`[${cmd}] 命令没有实现!`));
      }
    });
  }

  parse() {
    this.program.parse(process.argv);
  }

  run() {
    this.version();
    this.option();
    this.command();
    this.parse();
  }
};
