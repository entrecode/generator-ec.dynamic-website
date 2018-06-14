const {
  config,
  express,
  router,
  csp,
  datamanager,
  nunjucksEnv,
  cache,
} = require('visual-cms.website')('<%= name %>', __dirname);

const amqp = require('amqp-connection-manager');
const DMCache = require('ec.dm-cache');

csp['connect-src'] = [
  '*.entrecode.de',
];

/* ***********************
 * Define your routes here
 * *********************** */

router.get('/', (req, res) => res.render('index.njk', { name: '<%= name %>' }));

/* ***********************
 *   End of your routes
 * *********************** */

router.use(() => {
  throw Object.assign(new Error('not_found'));
});

router.use((error, req, res, next) => {
  switch (error.message) {
    case 'not_found':
      res.status(404);
      break;
    case 'gone':
      res.status(410);
      break;
    default:
      res.status(500);
      break;
  }

  if (process.env.NODE_ENV !== 'production') {
    return res.send({ error: error.stack });
  }

  return res.send({ error: error.message });
});

/* DO NOT CHANGE */
let dmCache;
if (config.amqp.active && config.dmCache) {
  const connectionManager = amqp.connect([config.amqp.url], { json: true });
  connectionManager.on('connect', c => console.info(` [*] connected to ${c.url}`));
  connectionManager.on('disconnect', () => console.warn(` [!] disconnected (${config.amqp.url})`));

  connectionManager.createChannel({
    setup(channel) {
      return channel.assertExchange('publicAPI', 'topic', { durable: true })
        .then(() => {
          dmCache = new DMCache(Object.assign({}, config.dmCache, {
            rabbitMQChannel: channel,
            sdkInstance: datamanager.datamanager,
            namespace: config.shortID,
          }));
          datamanager.useDMCache(dmCache);
        });
    },
  });
}

module.exports = express;
