'use strict';
const path = require('path');
const fs = require('fs');
const koa = require('koa');
const cors = require('kcors');
const chalk = require('chalk');
const { merge } = require('webpack-merge');
const helper = require('../utils/helper');
const historyMiddleware = require('../utils/history');
const hotMiddleware = require('../utils/koa-webpack-hot-middleware');
const devMiddleware = require('./dev');
const webpackDevMiddleware = require('webpack-dev-middleware');
const proxyMiddleware = require('./proxy');
const { nodeUtils, webpackUtils } = require('@noodles/utils');
const webpack = require('webpack');
const Navigation = require('./nav');
class WebpackTool {
  constructor(config) {
    this.config = merge(
      {
        debugPort: 8888,
        hot: false,
      },
      config
    );
    console.log(this.config, 7777);
    this.ready = false;
    this.cli = webpackUtils.getCli(this.config.cli);
    this.baseDir = this.config.baseDir || process.cwd();
    const pkgFile = path.join(this.baseDir, 'package.json');
    const defaultPkgInfo = { name: 'project', version: '1.0.0' };
    if (fs.existsSync(pkgFile)) {
      this.pkgInfo = Object.assign({}, defaultPkgInfo, require(pkgFile));
    } else {
      this.pkgInfo = defaultPkgInfo;
    }
  }

  green(msg, ex = '') {
    console.log(
      chalk.blueBright(`\r\n[${this.cli.name}] ${chalk.green(msg)}`),
      ex
    );
  }

  red(msg, ex = '') {
    console.log(
      chalk.blueBright(`\r\n[${this.cli.name}] ${chalk.red(msg)}`),
      ex
    );
  }
  //编译过程
  processCompilation(compilation) {
    compilation.stats.forEach(stat => {
      stat.compilation.children = stat.compilation.children.filter(child => {
        return (
          !/html-webpack-plugin/.test(child.name) &&
          !/mini-css-extract-plugin/.test(child.name)
        );
      });
    });
  }
  //打印编译
  printCompilation(compilation) {
    compilation.stats.forEach(stat => {
      process.stdout.write(
        `${stat.toString(
          merge(
            {
              colors: true,
              modules: false,
              children: true,
              chunks: false,
              chunkModules: false,
              entrypoints: false,
            },
            stat
          )
        )}\n`
      );
    });
  }

  getPort(target = 'web', offset = 0) {
    const NOODLES_ENV_DEV_PORT = `NOODLES_ENV_DEV_PORT_${this.pkgInfo.name}`;
    const port =
      this.config.port || Number(process.env[NOODLES_ENV_DEV_PORT]) || 9000;
    if (target === 'web') {
      return port;
    }
    return port + offset;
  }
  normalizeHotEntry(webpackConfig) {
    const target = webpackConfig.target;
    if (target === 'web') {
      const port = this.getPort(target);
      webpackUtils.normalizeHotEntry(webpack, port);
    } else {
    }
  }

  compilerHook(compiler, callback) {
    compiler.hooks.done.tap('webpack-tool-build-done', compilation => {
      callback(compilation);
    });
  }

  server(webpackConfig, options, callback) {
    return this.dev(
      webpackConfig,
      options,
      (compiler, compilation, webpackConfigItem) => {
        callback && callback(compiler, compilation, webpackConfigItem);
        const htmls = Object.keys(compilation.compilation.assets)
          .filter(url => {
            return /\.(html|htm)$/.test(url);
          })
          .sort();
        const port = this.getPort();

        if (htmls.length === 1) {
          const webpackConfig = compiler.options;
          const publicPath = webpackConfig.output.publicPath;
          const url = webpackUtils.normalizeURL(port, publicPath, htmls[0]);
          setTimeout(() => {
            this.green(`http visit url:${url}`);
          }, 200);
        } else {
          this.createDebugServer(compiler, compilation);
        }
      }
    );
  }

  dev(webpackConfig, callback) {
    let readyCount = 0;
    const compilers = [];
    const webpackConfigList = this.normalizeWebpackConfig(webpackConfig);
    webpackConfigList.forEach((webpackConfigItem, index) => {
      console.log(webpackConfigItem, 2323);
      this.normalizeHotEntry(webpackConfigItem);
      const compiler = webpack(webpackConfigItem);
      this.createWebpackServer(compiler, { offset: index });
      this.compilerHook(compiler, compilation => {
        readyCount++;
        if (!this.ready && readyCount % webpackConfigList.length === 0) {
          this.ready = true;
          callback && callback(compiler, compilation, webpackConfigItem);
        }
      });
      compilers.push(compiler);
    });
    return compilers;
  }

  build(webpackConfig, callback) {
    const webpackConfigList = this.normalizeWebpackConfig(webpackConfig);
    const compiler = webpack(webpackConfigList, (err, compilation) => {
      if (err || (compilation && compilation.hasErrors())) {
        if (err) {
          this.red(`[${__filename}] webpack build error`, err);
        }
        process.exit(1);
      }
    });
    this.compilerHook(compiler, compilation => {
      this.processCompilation(compilation);
      this.printCompilation(compilation);
      callback && callback(compiler, compilation);
    });
    return compiler;
  }

  createDebugServer(compiler, stats) {
    const config = this.config;
    const app = new koa();
    app.use(cors());

    app.use(async (ctx, next) => {
      if (ctx.url === '/debug') {
        ctx.body = await new Navigation(config, compiler, stats).create();
      } else {
        await next();
      }
    });
    let port = nodeUtils.getPort(this.config.debugPort);
    app.listen(port, err => {
      if (!err) {
        const devServer = this.devServer || {};
        const url = nodeUtils.getBrowserUrl(port, 'debug');
        if (devServer.open) {
          nodeUtils.open(url);
        }
        if (devServer.openPage) {
          nodeUtils.open(devServer.openPage);
        }
        this.green(`start webpack build navigation ui view: ${url}`);
      }
    });

    return app;
  }
  normalizeWebpackConfig(webpackConfig) {
    const webpackConfigList = Array.isArray(webpackConfig)
      ? webpackConfig
      : [webpackConfig];
    webpackConfigList.forEach(item => {
      if (item.devServer) {
        this.devServer = item.devServer;
        delete item.devServer;
      }
    });
    return webpackConfigList;
  }

  createWebpackCompiler(webpackConfig, callback) {
    const compiler = webpack(webpackConfig);
    compiler.hooks.done.tap('webpack-tool-build-done', compilation => {
      callback && callback(compiler, compilation);
    });
    return compiler;
  }

  createDevServerOptions(webpackConfig, devServer) {
    const { stats, watchOptions, output } = webpackConfig;
    return merge(
      {
        stats: {
          colors: true,
          children: true,
          modules: false,
          chunks: false,
          chunkModules: false,
          entrypoints: false,
        },
        headers: {
          'x-webpack': 'noodleswebpack',
          'cache-control': 'max-age=0',
        },
        watchOptions: {
          ignored: /node_modules/,
        },
        publicPath: output.publicPath,
      },
      {
        stats,
        watchOptions,
      },
      devServer
    );
  }
  //创建服务
  createWebpackServer(compiler, options = {}) {
    const offset = options.offset;
    const webpackConfig = compiler.options;
    const target = webpackConfig.target;
    const output = webpackConfig.output;
    const { devServer = {} } = this.config;
    const { before, after, historyApiFallback, proxy = {} } = devServer;
    const app = new koa();

    if (typeof before === 'function') {
      before(app);
    }

    app.use(cors());

    if (target === 'web' || target === undefined) {
      // http-proxy
      Object.keys(proxy).forEach(key => {
        app.use(proxyMiddleware(key, proxy[key]));
      });
      const historyOptions =
        historyApiFallback === true ? {} : historyApiFallback;

      app.use(historyMiddleware(historyOptions));
      app.use(hotMiddleware(compiler, { log: false, reload: true }));
    }

    const devOptions = this.createDevServerOptions(webpackConfig, devServer);
    app.use(devMiddleware(compiler, devOptions));

    if (typeof after === 'function') {
      after(app);
    }

    const port = (this.config.port = this.getPort(target, offset));
    app.listen(port, err => {
      if (!err) {
        const url = nodeUtils.getHost(port);
        if (target) {
          this.green(`start webpack ${target} building server: ${url}`);
        } else {
          this.green(`start webpack building server: ${url}`);
        }
        const key = target || 'web';
        helper.setInfo({
          [key]: {
            url,
            port,
            webpack: {
              context: webpackConfig.context,
              output: {
                path: output.path,
                publicPath: output.publicPath,
              },
            },
          },
        });
      }
    });
    return app;
  }
}
module.exports = WebpackTool;
