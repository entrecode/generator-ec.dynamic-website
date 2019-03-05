const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const FixStyleOnlyEntriesPlugin = require('webpack-fix-style-only-entries');

module.exports = {
  entry: {
    main: ['intersection-observer', 'babel-polyfill', './src/main.js'],
    styles: ['./style/style.scss'],
  },
  node: {
    fs: 'empty',
    Buffer: true,
    net: 'empty',
    tls: 'empty',
  },

  devtool: process.env.NODE_ENV === 'production' ? false : 'source-map',

  output: {
    path: path.resolve('static'),
    filename: 'main.js?hash=[hash]',
  },

  resolve: {
    alias: {
      vue: process.env.NODE_ENV === 'production' ? 'vue/dist/vue.min.js' : 'vue/dist/vue.esm.js',
    },
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        // exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              [
                '@babel/preset-env',
                {
                  targets: {
                    browsers: ['last 3 versions', 'ie 9'],
                  },
                },
              ],
            ],
            plugins: ['@babel/plugin-syntax-dynamic-import'],
          },
        },
      },
      {
        test: /\.scss$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
      },
    ],
  },
  optimization: {
    minimize: process.env.NODE_ENV === 'production',
  },
  mode: process.env.NODE_ENV,
  plugins: [
    new FixStyleOnlyEntriesPlugin(),
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: 'main.css?hash=[hash]',
      chunkFilename: 'main-[id].css?hash=[hash]',
    }),
    new ManifestPlugin(), // outputs hashes to manifest.json for getMinifiedFile nunjucks filter
  ],
};
