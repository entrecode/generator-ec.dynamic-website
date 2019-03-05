# generator-ec.dynamic-website [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url]
> A generator for a visual cms dynamic website for ec.render. By entrecode.

## Installation

First, install [Yeoman](http://yeoman.io) and generator-ec.dynamic-website using [npm](https://www.npmjs.com/) (we assume you have pre-installed [node.js](https://nodejs.org/)).

```bash
npm install -g yo
npm install -g generator-ec.dynamic-website
```

Then generate your new project:

```bash
mkdir myproject
cd myproject
yo ec.dynamic-website
```

## Getting To Know Yeoman

 * Yeoman has a heart of gold.
 * Yeoman is a person with feelings and opinions, but is very easy to work with.
 * Yeoman can be too opinionated at times but is easily convinced not to be.
 * Feel free to [learn more about Yeoman](http://yeoman.io/).

## ec Development info

- setup script is in `/generators/app/index.js`
- the seed project is in `/generators/app/templates`
- files that can simply be copied can be listed in the `justCopy` Array in the setup script
- You can fill in data requested by the generator with EJS, e.g. `<%= name %>`.
- files that need to be run through the template engine have to be listed in the `templatedCopy` 
Array in the setup script
- You can ask the user for additional data by adding a prompt in the setup script 
(uses [Inquirer.js](https://github.com/SBoudrias/Inquirer.js))
- don't forget to run the tests
- for local development, `npm link` the module, you can then use it in yo
- don't forget to `npm publish` new versions

## License

MIT © entrecode GmbH


[npm-image]: https://badge.fury.io/js/generator-ec.dynamic-website.svg
[npm-url]: https://npmjs.org/package/generator-ec.dynamic-website
[travis-image]: https://travis-ci.org/entrecode/generator-ec.dynamic-website.svg?branch=master
[travis-url]: https://travis-ci.org/entrecode/generator-ec.dynamic-website
[daviddm-image]: https://david-dm.org/entrecode/generator-ec.dynamic-website.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/entrecode/generator-ec.dynamic-website
