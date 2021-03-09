const webpackHotMiddleware = require('webpack-hot-middleware');

function middleware(doIt, req, res) {
  let originalEnd = res.end;
  return done => {
    res.end = () => {
      originalEnd.apply(this, arguments);
      done(null, 0);
    };
    doIt(req, res, () => {
      done(null, 1);
    });
  };
}

module.exports = function (compiler, option) {
  let action = webpackHotMiddleware(compiler, option);
  return async (ctx, next) => {
    let nextStep = await middleware(action, ctx.req, ctx.res);
    if (nextStep && next) {
      await next();
    }
  };
};
