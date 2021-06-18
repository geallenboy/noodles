const program = new commander.Command();
program
  .name(Object.keys(pkg.bin)[0])
  .usage('<command> [options]')
  .version(pkg.version)
  .option('-d, --debug', '是否开启调试模式', true)
  .option('-e, --env <envName>', '获取环境变量名称');

//command 注册命令
const clone = program.command('clone <source> [destination]');
clone
  .description('clone a file')
  .option('-f, --force', '是否强制克隆')
  .action((source, destionation, cmdObj) => {
    console.log('clone', source, destionation, cmdObj);
  });

// addCommand 注册命令
const service = new commander.Command('service');
service
  .command('start [port]')
  .description('start service at some port')
  .action(port => {
    console.log('do service start', port);
  });

service
  .command('stop [port]')
  .description('stop service')
  .action(port => {
    console.log('stop service');
  });

program.addCommand(service);

// program
//   .command('install [name]', 'install package', {
//     executableFile: 'noodlespro-cli',
//     isDefault: true,
//     hidden: false,
//   })
//   .alias('i');
// program
//   .arguments('<cmd> [options]')
//   .description('test command', {
//     cmd: 'command to run',
//     options: 'optons for command',
//   })
//   .action(function (cmd, options) {
//     console.log(cmd, options);
//   });

//实现自定义help信息
// program.helpInformation = function () {
//   return 'aa';
// };
//实现debug模式
program.on('option:debug', function () {
  console.log(program.opts().debug, 22);
  if (program.opts().debug) {
    process.env.LOG_LEVEL = 'verbose';
  }
  console.log(process.env.LOG_LEVEL);
});
//对未知命令监听
program.on('command:*', function (obj) {
  console.log(obj);
  console.error('未知对命令' + obj[0]);
  const availableCommands = program.commands.map(cmd => cmd.name());
  console.log('可用命令：', availableCommands.join(','));
});
program.parse(process.argv);
