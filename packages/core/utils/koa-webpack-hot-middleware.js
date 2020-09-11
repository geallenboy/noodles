const webpackHotMiddleware = require('webpack-hot-middleware');

function middleware(doIt, req, res) {
  let originalEnd = res.end;
  return function (done) {
    res.end = function () {
      originalEnd.apply(this, arguments);
      done(null, 0);
    };
    doIt(req, res, function () {
      done(null, 1);
    });
  };
}

module.exports = function (compiler, option) {
  let action = webpackHotMiddleware(compiler, option);
  return async function (ctx) {
    await middleware(action, ctx.req, ctx.res);
  };
};
