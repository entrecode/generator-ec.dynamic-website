/* DO NOT CHANGE THIS FILE */

process.chdir(__dirname);

const { config, server } = require('visual-cms.website')('<%= name %>', __dirname);
const cluster = require('cluster');
const clusterProcess = require('node-clusterprocess');
const logger = require('ec.logger');

logger.consoleCapture();
process.title = `${config.title}-w`;

require('./router');

clusterProcess.handleSignals(() => {
  server.close();
  if (cluster.worker) {
    cluster.worker.disconnect();
  }
});
