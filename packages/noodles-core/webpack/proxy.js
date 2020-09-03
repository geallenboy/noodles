'use strict';
const c2k = require('koa-connect');
const proxyMiddleware = require('http-proxy-middleware');

module.exports = function (proxyUrl, proxyOptions) {
  // 新功能，前端项目支持 pathRewrite
  if (proxyOptions && proxyOptions.pathRewrite) {
    return async function (res, next) {
      if (new RegExp(proxyUrl).test(res.url)) {
        await c2k(proxyMiddleware(proxyOptions));
      } else {
        await next();
      }
    };
  }
  // 先保留之前的实现保证稳定性
  const proxy = require('http-proxy').createProxyServer(proxyOptions);
  return async function (ctx, next) {
    if (new RegExp(proxyUrl).test(ctx.url)) {
      await function (callback) {
        proxy.web(ctx.req, ctx.res, callback);
      };
    } else {
      await next();
    }
  };
};