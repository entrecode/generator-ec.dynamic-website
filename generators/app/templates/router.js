const {
  config,
  express,
  router,
  csp,
  datamanager,
  nunjucksEnv,
  cache,
} = require('visual-cms.website')('<%= name %>', __dirname);

csp['connect-src'] = [
  '*.entrecode.de'
];

/* define your routes here */
router.get('/', (req, res) => {
  return Promise.resolve({ data: { name: '<%= name %>' } })
  .then(data => res.render('index.html', data));
});

if (module.parent) {
  module.exports = express;
} else {
  const port = process.env.npm_package_config_port || 3003;
  express.listen(port, () => {
    console.log(`dev server listening at http://localhost:${port}/`);
  });
}
