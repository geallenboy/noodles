'use strict';
const chalk = require('chalk');

module.exports = {
  log(info, color = 'green') {
    /* istanbul ignore next */
    console.log(chalk.blue(`[cli]:${chalk[color](info)}`));
  },
};
