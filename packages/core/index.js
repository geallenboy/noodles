'use strict';
const WebpackTool = require('webpack-tool');
const { option } = require('commander');
exports.WebpackTool = WebpackTool;
exports.webpack = WebpackTool.webpack;
exports.merge = WebpackTool.merge;

exports.getConfig = (config={},option = {}) => {
    return 
}
