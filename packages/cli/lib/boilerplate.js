'use strict';
const inquirer = require('inquirer');
const infolist = require('./infolist');
const Load = require('./load');

module.exports = class Answ {
  constructor(command) {
    this.command = command;
    this.program = command.program;
    this.baseDir = command.baseDir;
    this.projectDir = process.cwd();
    this.infolist = infolist;
    this.templateList = this.infolist.templateList;
    this.templateListChoice = this.infolist.templateListChoice;
    this.projectChoice = this.infolist.projectChoice;
  }
  getBoilerplateInfo(name) {
    return this.templateList.find((item) => {
      return name === item.value;
    });
  }
  getProjectChoices(ranges) {
    if (ranges === undefined) {
      return this.projectChoice;
    }
    return ranges.map((range) => {
      return this.projectChoice.filter((choice) => {
        return choice.name === range;
      })[0];
    });
  }
  getBoilerplateDetailInfo(boilerplate, project) {
    const filterItems = this.templateListChoice[boilerplate].filter(
      (item) => project === item.value,
    );
    return filterItems.length > 0 ? filterItems[0] : null;
  }
  init(options) {
    inquirer
      .prompt([
        {
          type: 'list',
          name: 'boilerplateName',
          message: 'please choose the boilerplate mode?',
          choices: this.templateList,
        },
      ])
      .then((boilerplateAnswer) => {
        const boilerplateName = boilerplateAnswer.boilerplateName;
        const boilerplateInfo = this.getBoilerplateInfo(boilerplateName);
        const choices = boilerplateInfo.choices;
        if (this.templateListChoice[boilerplateName]) {
          const boilerplateDetail = [
            {
              type: 'list',
              name: 'project',
              message: 'please choose the boilerplate project mode?',
              choices: this.templateListChoice[boilerplateName],
            },
          ];
          inquirer.prompt(boilerplateDetail).then((boilerplateDetailAnswer) => {
            const project = boilerplateDetailAnswer.project;
            const bilerplateInfo = this.getBoilerplateDetailInfo(
              boilerplateName,
              project,
            );
            const projectInfoChoice = this.getProjectChoices(choices);

            inquirer.prompt(projectInfoChoice).then((projectInfoAnswer) => {
              console.log(this.projectDir, bilerplateInfo, projectInfoAnswer);
            });
          });
        } else {
          const pkgName = boilerplateName;
          const projectInfoChoice = this.getProjectChoices(choices);
          inquirer.prompt(projectInfoChoice).then((projectInfoAnswer) => {
            const specialBoilerplateInfo = {
              pkgName,
              run: boilerplateInfo.run,
            };
            console.log(
              this.projectDir,
              specialBoilerplateInfo,
              projectInfoAnswer,
            );
          });
        }
      });
  }
};
