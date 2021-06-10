#! /usr/bin/env node
const help = require('@noodles/help');
const importLocal = require('import-local');

if (importLocal(__filename)) {
  require('npmlog').info('cli', '正在使用 noodles 本地版本');
} else {
  require('../lib')(process.argv.slice(2));
}
