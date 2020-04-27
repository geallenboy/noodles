'use strict';
const chalk = require('chalk');

exports.templateList = [
  {
    name: `Create ${chalk.green('react')} Application`,
    value: 'boilerplate-react',
  },
  {
    name: `Create ${chalk.green('node+react')} Application`,
    value: 'boilerplate-node-react',
  },
  {
    name: `Create ${chalk.green('HTML')} Application`,
    value: 'boilerplate-html',
  },
];

exports.templateListChoice = {
  'boilerplate-react': [
    {
      name: `Create ${chalk.green('react single')} Application`,
      value: 'snrc-react',
      pkgName: 'snrc-react',
    },
    {
      name: `Create ${chalk.green('react typeScript single')} Application`,
      value: 'snrc-react-typeScript',
      pkgName: 'snrc-react-typeScript',
    },
    {
      name: `Create ${chalk.green('react+redux')} Application`,
      value: 'snrc-react-redux',
      pkgName: 'snrc-react-redux',
    },
    {
      name: `Create ${chalk.green('react+mobox')} Application`,
      value: 'snrc-react-mobox',
      pkgName: 'snrc-react-mobox',
    },
    {
      name: `Create ${chalk.green('react pro')} Application`,
      value: 'snrc-react-pro',
      pkgName: 'snrc-react-pro',
    },
  ],
  'boilerplate-node-react': [
    {
      name: `Create ${chalk.green('node+react')} ${chalk.green(
        'Single Page',
      )} Application`,
      value: 'snrc-node-rect',
      pkgName: 'snrc-node-react',
    },
    {
      name: `Create ${chalk.green('node react pro')} Application`,
      value: 'snrc-node-react-pro',
      pkgName: 'snrc-node-react-pro',
    },
  ],
};

exports.projectChoice = [
  {
    type: 'input',
    name: 'name',
    message: 'Please input project name:',
  },
  {
    type: 'input',
    name: 'description',
    message: 'Please input project description:',
  },
  {
    type: 'checkbox',
    name: 'style',
    message: 'Please choose css style:',
    choices: [
      {
        name: 'css',
        value: 'css',
        checked: true,
      },

      {
        name: 'less',
        value: 'less',
      },
    ],
  },
  {
    type: 'list',
    name: 'npm',
    message: 'Please choose the way to install dependency:',
    choices: [
      {
        name: 'npm',
        value: 'npm',
        checked: true,
      },
      {
        name: 'yarn',
        value: 'yarn',
      },
    ],
  },
];
