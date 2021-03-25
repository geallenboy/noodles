#!/usr/bin/env node

'use strict';
const { name, bin } = require('../package.json');
const Command = require('../lib/command');
new Command().run();
