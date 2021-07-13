'use strict';

const Command = require('@noodlespro/command');

function init(argv) {
  return new initCommand(argv);
}

class initCommand extends Command {
  init() {
    this.projectName = this._argv[0] || '';
    this.force = this._argv[this._argv.length - 1].force;
    console.log('init 业务代码逻辑');
  }
}

module.exports = init;
module.exports.initCommand = initCommand;
