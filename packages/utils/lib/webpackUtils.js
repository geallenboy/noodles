'use strict';

exports.getCli = (cli) => {
  if (cli && cli.name && cli.cmd) {
    return cli;
  }
  return global.NOODLES_CLI || { name: 'noodles-cli', cmd: 'nood' };
};

exports.normalizeHotEntry = (webpackConfig, port) => {
  const hotMiddleware = require
    .resolve('webpack-hot-middleware')
    .split(path.sep);
  hotMiddleware.pop();
  const hotConfig = `${path.posix.join(
    hotMiddleware.join(path.sep),
  )}/client?path=http://${utils.getIp()}:${port}/__webpack_hmr&noInfo=false&reload=true&quiet=false`;
  Object.keys(webpackConfig.entry).forEach((name) => {
    const value = webpackConfig.entry[name];
    const tempValues = Array.isArray(value) ? value : [value];
    const isHot = tempValues.some((v) => {
      return /webpack-hot-middleware/.test(v);
    });
    if (!isHot) {
      webpackConfig.entry[name] = [hotConfig].concat(value);
    }
  });
  return webpackConfig;
};

exports.normalizeURL = (port, publicPath, filename) => {
  if (/^(https?:|\/\/)/.test(publicPath)) {
    return publicPath + filename;
  }
  const host = utils.getHost(port);
  return `${host + publicPath + filename}`;
};
