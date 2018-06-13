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
  ['gitignore', '.gitignore'],
  'Dockerfile',
  'extensions/.npmignore',
  'static/.npmignore',
  'views/index.html'
];
const templatedCopy = [
  'package.json',
  'readme.md',
  'router.js',
  'config/default.yml',
  'test/basic.test.js'
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
      message: 'Your project name:',
      default: this.appname // Default to current folder name
    }, {
      type: 'input',
      name: 'git',
      message: 'Please specify the git repository:',
      default: `ssh://git@stash.entrecode.de:7999/${this.appname}/${this.appname}.dynamic-website.git`
    }, {
      type: 'input',
      name: 'dataManagerID',
      message: 'Which Data Manager ID?',
      validate: id => /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/i.test(id)
    }, {
      type: 'list',
      name: 'datamanagerRootURL',
      message: 'Which Data Manager do you want to use?',
      choices: [
        'https://datamanager.entrecode.de',
        'https://datamanager.cachena.entrecode.de',
        'https://datamanager.buffalo.entrecode.de'
      ],
      default: 'https://datamanager.entrecode.de'
    }, {
      type: 'confirm',
      name: 'search',
      message: 'Do you need ec.search?',
      default: false
    }];

    return this.prompt(prompts).then(props => {
      // To access props later use this.props.someAnswer;
      props.shortID = shortenUUID(props.dataManagerID, 2);
      if (props.search) {
        if (props.datamanagerRootURL === 'https://datamanager.cachena.entrecode.de') {
          props.search = 'https://search.cachena.entrecode.de';
        } else {
          props.search = 'https://search.entrecode.de';
        }
      }
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
    this.npmInstall(['visual-cms.website'], {save: true});
    this.npmInstall(['chai', 'html-validator', 'mocha', 'mocha-bamboo-reporter', 'node-sass', 'supertest'], {'save-dev': true});
  }
};
