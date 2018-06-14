const defer = require('config/defer').deferConfig;

const envs = {
  live: 'https://datamanager.entrecode.de',
  stage: 'https://datamanager.cachena.entrecode.de',
  nightly: 'https://datamanager.buffalo.entrecode.de',
};

module.exports = {
  datamanagerURL: defer(config => `${envs[config.env]}/api/${config.shortID}`),
  datamanagerRootURL: defer(config => `${envs[config.env]}`),
};
