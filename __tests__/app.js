'use strict';
var path = require('path');
var assert = require('yeoman-assert');
var helpers = require('yeoman-test');

describe('generator-ec.dynamic-website:app', () => {
  beforeAll(() => {
    return helpers.run(path.join(__dirname, '../generators/app'))
      .withPrompts({dataManagerID: 'afea8e47-486f-43a1-ba79-6797a224890c'});
  });

  it('creates files', () => {
    assert.file([
      'router.js',
      'package.json',
      'views/index.html'
    ]);
  });
});
