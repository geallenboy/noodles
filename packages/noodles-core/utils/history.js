'use strict';

const url = require('url');

function evaluateRewriteRule(parsedUrl, match, rule) {
  if (typeof rule === 'string') {
    return rule;
  } else if (typeof rule !== 'function') {
    throw new Error('Rewrite rule can only be of type string of function.');
  }

  return rule({
    parsedUrl: parsedUrl,
    match: match,
  });
}

function acceptsHtml(header) {
  return header.indexOf('text/html') !== -1 || header.indexOf('*/*') !== -1;
}

function getLogger(options) {
  if (options && options.logger) {
    return options.logger;
  } else if (options && options.verbose) {
    return console.log.bind(console);
  }
  return function () {};
}

module.exports = function koaFallbackApiMiddleware(options) {
  options = options || {};
  let logger = getLogger(options);

  return async function (ctx) {
    let headers = ctx.headers,
      reqUrl = ctx.url,
      method = ctx.method;

    if (ctx.method !== 'GET') {
      await logger(
        'Not rewriting',
        method,
        reqUrl,
        'because the method is not GET.',
      );
    } else if (!headers || typeof headers.accept !== 'string') {
      await logger(
        'Not rewriting',
        method,
        reqUrl,
        'because the client did not send an HTTP accept header.',
      );
    } else if (headers.accept.indexOf('application/json') === 0) {
      await logger(
        'Not rewriting',
        method,
        reqUrl,
        'because the client prefers JSON.',
      );
    } else if (!acceptsHtml(headers.accept)) {
      await logger(
        'Not rewriting',
        method,
        reqUrl,
        'because the client does not accept HTML.',
      );
    }

    let parsedUrl = url.parse(reqUrl);
    let rewriteTarget;

    options.rewrites = options.rewrites || [];

    for (let i = 0; i < options.rewrites.length; i++) {
      let rewrite = options.rewrites[i];
      let match = parsedUrl.pathname.match(rewrite.from);
      if (match !== null) {
        rewriteTarget = evaluateRewriteRule(parsedUrl, match, rewrite.to);
        await logger('Rewriting', method, reqUrl, 'to', rewriteTarget);
        this.url = rewriteTarget;
      }
    }

    if (parsedUrl.pathname.indexOf('.') !== -1) {
      await logger(
        'Not rewriting',
        method,
        reqUrl,
        'because the path includes a dot (.) character.',
      );
    }

    rewriteTarget = options.index || '/index.html';
    await logger('Rewriting', method, reqUrl, 'to', rewriteTarget);
    this.url = rewriteTarget;
  };
};
