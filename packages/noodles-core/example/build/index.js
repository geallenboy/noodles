//build/index.js
const WebpackTool = require('../../webpack/tool');
// const WebpackTool = require('webpack-tool');
const NODE_ENV = process.env.VIEW;
console.log(WebpackTool, 33);
const webpackTool = new WebpackTool({
  devServer: {
    before: (before) => {
      // register koa middleware
    },
    after: (app) => {
      // register koa middleware
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        pathRewrite: { '^/api': '' },
      },
    },
    historyApiFallback: {
      index: '/app.html',
    },
  },
});

const webpackConfig = {
  entry: {
    index: './src/index.js',
  },
  output: {
    publicPath: 'dist',
  },
  mode: 'production',
  module: {
    rules: [],
  },
  plugins: [],
};

// if (NODE_ENV === 'development') {
//   // start webpack build and show build result ui view
//   webpackTool.server(webpackConfig);
// } else {
//   // if you want to show build result ui view for build mode, please set  process.env.BUILD_VIEW=true
//   webpackTool.build(webpackConfig);
// }
webpackTool.build(webpackConfig);