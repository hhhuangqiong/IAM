import path from 'path';
import webpack from 'webpack';
import cssnext from 'postcss-cssnext';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import { getSupportedLangs } from './src/utils/intl';
const nodeEnv = process.env.NODE_ENV;
const enableHotloader = process.env.ENABLE_WEBPACK_HOTLOADER === 'true';

// The path to find when @import is used in the scss file
const scssModulePaths = [
  './node_modules',
  './node_modules/m800-web-styleguide/scss',
].map(scssModulePath => `includePaths[]=${path.resolve(__dirname, scssModulePath)}`).join(',');

// For remove unused locale data
const langStrRegex = new RegExp(getSupportedLangs().join('|', 'i'));

const config = {
  entry: {
    login: ['babel-polyfill', './src/clients/login'],
    resetPassword: ['babel-polyfill', './src/clients/resetPassword'],
    setPassword: ['babel-polyfill', './src/clients/setPassword'],
  },
  output: {
    path: path.resolve(__dirname, './public/assets/app'),
    filename: '[name].bundle.js',
    publicPath: '/assets/app/',
  },
  resolve: {
    alias: {
      react: path.resolve(__dirname, './node_modules/react'),
      'react/addons': path.resolve(__dirname, './node_modules/react/addons'),
    },
    extensions: ['', '.js', '.jsx', '.json'],
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        include: [
          path.resolve(__dirname, './src'),
        ],
        exclude: /node_modules/,
        loader: 'babel',
      },
      { test: /\.json$/, loader: 'json' },
      {
        test: /\.svg$/,
        loader: 'svg-inline',
      },
    ],
  },
  plugins: [
    // only load supported locale data in moment and react-intl
    new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, langStrRegex),
    new webpack.ContextReplacementPlugin(/react-intl[\/\\]locale-data$/, langStrRegex),
    // resolve to use joi-browser for client-side joi
    new webpack.NormalModuleReplacementPlugin(/^joi$/, path.resolve(__dirname, './node_modules/joi-browser')),
    new webpack.optimize.CommonsChunkPlugin('common.bundle.js'),
  ],
  postcss: () => [
    cssnext({ browsers: ['last 2 versions'] }),
  ],
};

if (nodeEnv === 'production') {
  config.plugins.push(
    new webpack.DefinePlugin({
      'process.env': { NODE_ENV: '"production"' },
    }),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin()
  );
} else {
  config.devtool = 'eval-source-map';
  config.plugins.push(new webpack.NoErrorsPlugin());
}

if (enableHotloader) {
  config.module.loaders[0].query = { presets: ['react-hmre'] };
  config.module.loaders.push({
    test: /(\.css|\.scss)$/,
    loaders: ['style', 'css?sourceMap', 'postcss', `sass?sourceMap&${scssModulePaths}`],
  });
} else {
  config.module.loaders.push({
    test: /(\.css|\.scss)$/,
    loader: ExtractTextPlugin.extract('style', ['css', 'postcss', `sass?${scssModulePaths}`]),
  });
  config.plugins.push(new ExtractTextPlugin('style.css'));
}

module.exports = config;
