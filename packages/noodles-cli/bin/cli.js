#!/usr/bin/env node

'use strict';
const { name, bin } = require('../package.json');
console.log(name, bin);
const Command = require('../lib/command');
new Command().run();
