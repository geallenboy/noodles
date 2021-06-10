#! /usr/bin/env node
const help = require('@noodlespro/help');
const importLocal = require('import-local');

if (importLocal(__filename)) {
  require('npmlog').info('cli', '正在使用 noodlespro 本地版本');
} else {
  require('../lib')(process.argv.slice(2));
}
