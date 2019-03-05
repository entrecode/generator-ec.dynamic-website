'use strict';
const Generator = require('yeoman-generator');
const chalk = require('chalk');
const yosay = require('yosay');

/**
 * Function shortenUUID(uuid[, factor])
 *
 * shortens a UUID by XORing the the top half with the bottom half
 * The default shortening factor is 1, maximum is 5 (just one character returned).
 *
 * @param {string} uuid A UUID v4 (including dashes)
 * @param {number} factor A int 1-5, default is 1 (16 characters returned). Recommended is 2 (8
 *   characters returned).
 * @returns {string} 1-16 character hex string
 */
function shortenUUID(uuid, factor) {
  let shortUUID;
  let validatedFactor;
  if (!/^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i.test(uuid) || (factor && typeof factor !== 'number')) {
    throw new Error('invalid parameter format');
  }
  if (!factor || factor < 1 || factor > 5) { // Set factor to 1 as default
    validatedFactor = 1;
  } else {
    validatedFactor = factor;
  }
  shortUUID = uuid.replace(/-/g, ''); // Strip the dashes out of the UUID
  shortUUID = shortUUID.split(''); // Turn into Array
  shortUUID = shortUUID.map(element => // Parse Integer value out of hex value
    parseInt(element, 16));
  let j;
  let l;

  function xor(val, index) {
    return val ^ shortUUID[(l / 2) + index]; // XOR the given value of the first half with the corresponding of the second half
  }

  for (j = 0; j < validatedFactor; j++) { // Factor times XORing
    l = shortUUID.length;
    shortUUID = shortUUID.slice(0, l / 2).map(xor);
  }
  shortUUID = shortUUID.map(element => // Turn back into hex value
    element.toString(16));
  shortUUID = shortUUID.join(''); // Make array to string
  return shortUUID;
}

const justCopy = [
  'config/custom-environment-variables.yml',
  'config/development.yml',
  'config/production.yml',
  'config/local.js',
  'extensions/.npmignore',
  'rancher_templates',
  'src',
  'static/.npmignore',
  'style',
  ['vscode', '.vscode'],
  ['gitignore', '.gitignore'],
  'Dockerfile',
  'server.js',
  'webpack.config.js'
];
const templatedCopy = [
  'config/default.yml',
  'config/stage.yml',
  'test/basic.test.js',
  'views',
  'package.json',
  'readme.md',
  'router.js',
  'worker.js'
];

module.exports = class extends Generator {
  prompting() {
    // Have Yeoman greet the user.
    this.log(yosay(
      'Welcome to the legendary ' + chalk.red('ec.dynamic-website') + ' generator!'
    ));

    const prompts = [{
      type: 'input',
      name: 'name',
      message: 'Your project name (without dynamic-website suffix):',
      default: this.appname // Default to current folder name
    }, {
      type: 'input',
      name: 'git',
      message: 'Please specify the git repository:',
      default: `git@github.com:entrecode/${this.appname}.dynamic-website.git`
    }, {
      type: 'input',
      name: 'dataManagerID',
      message: 'Which Data Manager ID?',
      validate: id => /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/i.test(id)
    }, {
      type: 'list',
      name: 'env',
      message: 'Which environment to use?',
      choices: [
        'live',
        'stage',
        'nightly'
      ],
      default: 'live'
    }];

    return this.prompt(prompts)
      .then(props => {
        // To access props later use this.props.someAnswer;
        props.shortID = shortenUUID(props.dataManagerID, 2);
        this.props = props;
      });
  }

  writing() {
    templatedCopy.forEach(filename => this.fs.copyTpl(
      this.templatePath(filename),
      this.destinationPath(filename),
      this.props
    ));
    justCopy.forEach(filename => {
      if (Array.isArray(filename)) {
        this.fs.copy(
          this.templatePath(filename[0]),
          this.destinationPath(filename[1])
        );
      } else {
        this.fs.copy(
          this.templatePath(filename),
          this.destinationPath(filename)
        );
      }
    });
  }

  install() {
    this.npmInstall([
      'config',
      'entrecode/ec.amqp',
      'entrecode/ec.dm-cache',
      'entrecode/ec.logger',
      'node-clusterprocess',
      'sitemap',
      'visual-cms.website',
      'winston',
      'winston-aws-cloudwatch',
    ], { save: true });
    this.npmInstall([
      '@babel/core',
      '@babel/plugin-syntax-dynamic-import',
      '@babel/preset-env',
      'babel-loader',
      'babel-polyfill',
      'chai',
      'css-loader',
      'html-validator',
      'intersection-observer',
      'mini-css-extract-plugin',
      'mocha',
      'mocha-bamboo-reporter',
      'node-sass',
      'postcss-loader',
      'sass-loader',
      'style-loader',
      'supertest',
      'vue',
      'webpack',
      'webpack-cli',
      'webpack-fix-style-only-entries',
      'webpack-manifest-plugin',
      'x.ui'
    ], { 'save-dev': true });
  }
};
