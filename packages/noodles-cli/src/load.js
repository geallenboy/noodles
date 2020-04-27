'use strict';
const path = require('path');
const shell = require('shelljs');
const chalk = require('chalk');
const ora = require('ora');
const utils = require('./utils');

module.exports = class Load {
  constructor(config = {}) {}

  /**
   * 复制路径
   * @param {*} sourceDir 需要复制的目录
   * @param {*} targetDir 复制到指定的目录
   * @param {*} option
   */
  copy(sourceDir, targetDir, option = { dir: '', hide: true }) {
    if (options.dir) {
      shell.cp('-R', path.join(sourceDir, option.dir), targetDir);
    } else {
      shell.cp('-R', path.join(sourceDir, '*'), targetDir);
      if (option.hide) {
        try {
          shell.cp('-R', path.join(sourceDir, '.*'), targetDir);
        } catch (error) {
          console.warn('复制隐藏文件错误', e);
        }
      }
    }
  }
};
