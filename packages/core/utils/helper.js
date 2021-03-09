'use strict';
const path = require('path');
const fs = require('fs');
const os = require('os');
const assert = require('assert');
const { nodeUtils } = require('@noodles/utils');
const { merge } = require('webpack-merge');

exports.getCompileTemDir = (project, filename = '') => {
  return path.join(os.tmpdir(), 'noodles', project, filename);
};

exports.getInfoFilePath = project => {
  return this.getCompileTemDir(project, 'noodles.json');
};

exports.getInfo = project => {
  if (!project) {
    const pkgfile = path.join(process.cwd(), 'package.json');
    const pkg = require(pkgfile);
    project = pkg.package || pkg.name;
  }
  const filepath = this.getInfoFilePath(project);
  if (fs.existsSync(filepath)) {
    return nodeUtils.readFile(filepath);
  }
  return {};
};

exports.setInfo = async (json, clear = false) => {
  const pkgfile = path.join(process.cwd(), 'package.json');
  const pkg = require(pkgfile);
  const project = pkg.package || pkg.name;

  assert(project, 'package.json file missing name config');
  const filepath = this.getInfoFilePath(project);
  if (clear) {
    nodeUtils.writeFile(filepath, json);
  } else {
    const getInfo = this.getInfo(project);
    const info = merge(getInfo, json);
    nodeUtils.writeFile(filepath, info);
  }
};
