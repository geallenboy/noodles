const webpackDevMiddleware = require('webpack-dev-middleware');

function middleware(doIt, req, res) {
  const { end: originalEnd } = res;
  return done => {
    res.end = function end() {
      originalEnd.apply(this, arguments);
      done(null, 0);
    };
    doIt(req, res, () => {
      done(null, 1);
    });
  };
}

module.exports = function (compiler, option) {
  const doIt = webpackDevMiddleware(compiler, option);
  async function koaMiddleware(ctx, next) {
    const { req } = ctx;
    const locals = ctx.locals || ctx.state;
    ctx.webpack = doIt;
    const runNext = await middleware(doIt, req, {
      end(content) {
        ctx.body = content;
      },
      locals,
      setHeader() {
        ctx.set.apply(ctx, arguments);
      },
    });
    if (runNext) {
      await next();
    }
  }

  Object.keys(doIt).forEach(p => {
    koaMiddleware[p] = doIt[p];
  });

  return koaMiddleware;
};
