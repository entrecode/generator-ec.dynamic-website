const { config, express, router, csp, datamanager, nunjucksEnv, cache } = require('visual-cms.website')(
  '<%= name %>',
  __dirname,
);

const DMCache = require('ec.dm-cache');
const sitemap = require('sitemap');
const { promisify } = require('util');
const logger = require('ec.logger');
const { version } = require('./package');

/* content security policies */
csp['connect-src'] = ['*.entrecode.de'];
csp['style-src'] = [csp.SELF];
csp['script-src'] = [csp.SELF, "'unsafe-eval'"];

const minifiedFiles = require('./static/manifest.json');

nunjucksEnv.addFilter('getMinifiedFile', (filename) => {
  if (filename in minifiedFiles) {
    return minifiedFiles[filename];
  }
  throw new Error(`${filename} was not found in manifest.json.`);
});

/* globally available nunjucks variables (locals) */
router.use(async (req, res) => {
  const { publicURL, analyticsID } = config;
  Object.assign(res, {
    locals: {
      version,
      publicURL,
      analyticsID,
      env: process.env.NODE_ENV,
    },
  });
  return 'next';
});

/* robots.txt. If config.disableCrawling is set, only seobility is allowed */
router.get('/robots.txt', cache.middleware(60 * 10), (req, res) => {
  res.set('Content-Type', 'text/plain');
  if (config.get('disableCrawling')) {
    return res.send(Buffer.from(['User-agent: Seobility', 'Allow: /', 'User-agent: *', 'Disallow: /'].join('\n')));
  }
  return res.send(Buffer.from(['User-agent: *'].join('\n')));
});

/* default sitemap. All main pages should be added here */
router.get('/sitemap.xml', cache.middleware(60 * 60 * 2), async (req, res) => {
  const sm = sitemap.createSitemap({
    hostname: config.publicURL,
    cacheTime: 60,
    sitemapSize: 10000,
    urls: [{ url: '/', changefreq: 'daily', priority: 1.0 }],
  });
  sm.limit = 10000; // undocumented how it actually works… Google only allows 10k, not 50k
  const xml = await promisify(sm.toXML).call(sm);
  res.header('Content-Type', 'application/xml');
  res.send(xml);
});

/* ***********************
 * Define your routes here
 * *********************** */

router.get('/', cache.middleware(60 * 60 * 24), (req, res) => {
  res.render('index.njk', { name: '<%= name %>' });
});

/* ***********************
 *   End of your routes
 * *********************** */

router.use(() => {
  throw Object.assign(new Error('not_found'));
});

router.use((error, req, res, next) => {
  const referer = 'referer' in req.headers ? ` Referer: ${req.headers.referer}` : undefined;
  if (!error.message && error.title) {
    Object.assign(error, {
      message: error.title,
    });
  }
  switch (error.message) {
    case 'not_found':
    case 'No resource entity matching query string filter found':
    case 'Resource not found':
      res.status(404);
      Object.assign(error, { status: 404 });
      logger.warn('error 404', {
        url: req.originalUrl,
        referer,
      });
      break;
    case 'gone':
      res.status(410);
      Object.assign(error, { status: 410 });
      break;
    default:
      res.status(500);
      logger.error('error 500', error);
      break;
  }

  const data = {
    error: error.message,
    stack: error.stack,
  };

  return res.send(data);
});

/* DO NOT CHANGE */
let dmCache;
if (config.amqp.active && config.dmCache) {
  const amqp = require('ec.amqp');
  Promise.resolve()
    .then(() => amqp.plainChannel('publicAPI'))
    .then((rabbitMQChannel) => {
      dmCache = new DMCache({
        sdkInstance: datamanager.datamanager,
        rabbitMQChannel,
        namespace: config.shortID,
        cacheSize: config.dmCache.cacheSize, // max items in cache
        appendSource: config.dmCache.appendSource, // set to true to append property 'dmCacheHitFrom' to each response
        timeToLive: config.dmCache.timeToLive,
      });
      datamanager.useDMCache(dmCache);
    })
    .catch(logger.error);
}

module.exports = express;
