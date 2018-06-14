/* DO NOT CHANGE THIS FILE */

process.chdir(__dirname);

const logger = require('ec.logger');
const cluster = require('node-clusterprocess');
const config = require('config');

if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development';
}

logger.info(`Starting with ${(process.env.NODE_ENV || 'development')}`);

cluster
  .setLogger(logger)
  .run('worker.js', config.title);
