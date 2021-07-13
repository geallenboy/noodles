'use strict';
const cp = require('child_process');
const Package = require('@noodlespro/package');
const log = require('@noodlespro/log');
const path = require('path');
const SETTINGS = {
  init: '@noodlespro/init', //'@noodlespro/init',
};
const CACHE_DIR = 'dependencies';

async function exec() {
  let targetPath = process.env.CLI_TARGET_PATH;
  const homePath = process.env.CLI_HOME_PATH;
  log.verbose('targetPath', targetPath);
  log.verbose('homePath', homePath);
  let storeDir = '';
  let pkg;
  let cmdObj = arguments[arguments.length - 1];
  const cmdName = cmdObj.name();
  const packageName = SETTINGS[cmdName];
  const packageVersion = 'latest';

  if (!targetPath) {
    targetPath = path.resolve(homePath, CACHE_DIR); //生成缓存路径
    storeDir = path.resolve(targetPath, 'node_modules');
    log.verbose('targetPath', targetPath);
    log.verbose('storeDir', storeDir);
    pkg = new Package({
      targetPath: targetPath,
      storeDir: storeDir,
      packageName: packageName,
      packageVersion: packageVersion,
    });
    if (await pkg.exists()) {
      //更新package
      console.log('更新package');
      await pkg.update();
    } else {
      console.log('安装package');
      //安装package
      await pkg.install();
    }
  } else {
    pkg = new Package({
      targetPath,
      storeDir,
      packageName,
      packageVersion,
    });

    const rootFile = pkg.getRootFilePath();

    if (rootFile) {
      try {
        //当前进程中调用
        // require(rootFile).call(null, Array.from(arguments));
        //在node 子进程中调用
        const args = Array.from(arguments);

        const cmd = args[args.length - 1];

        const o = Object.create(null);
        Object.keys(cmd).forEach(key => {
          if (
            cmd.hasOwnProperty(key) &&
            !key.startsWith('_') &&
            key !== 'parent'
          ) {
            o[key] = cmd[key];
          }
        });

        args[args.length - 1] = o;
        const code = ` require('${rootFile}').call(null, ${JSON.stringify(
          args
        )})`;
        const child = spawn('node', ['-e', code], {
          cwd: process.cwd(),
          stdio: 'inherit',
        });
        child.on('error', e => {
          log.error(e.message);
          process.exit(1);
        });

        child.on('exit', e => {
          log.verbose('命令执行成功：' + e);
          process.exit(e);
        });
      } catch (error) {
        log.error(error.message);
      }
    }
  }
}

function spawn(command, args, options) {
  const win32 = process.platform === 'win32';
  const cmd = win32 ? 'cmd' : command;
  const cmdArgs = win32 ? ['/c'].concat(command, args) : args;
  return cp.spawn(cmd, cmdArgs, options || {});
}

module.exports = exec;
