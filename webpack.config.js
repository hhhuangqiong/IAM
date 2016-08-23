const path = require('path');
const webpack = require('webpack');

// The path to find when @import is used in the scss file
const scssModulePaths = [
  './node_modules',
  './node_modules/m800-web-styleguide/scss',
].map(scssModulePath => `includePaths[]=${path.resolve(__dirname, scssModulePath)}`).join(',');

module.exports = {
  devtool: 'cheap-module-eval-source-map',
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
    extensions: ['', '.js', '.jsx'],
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        include: [
          path.resolve(__dirname, './src'),
        ],
        exclude: /node_modules/,
        loaders: ['babel'],
      },
      { test: /\.json$/, loader: 'json' },
      { test: /(\.css|\.scss)$/, loaders: ['style', 'css?sourceMap', `sass?sourceMap&${scssModulePaths}`] },
      {
        test: /\.svg$/,
        loader: 'svg-inline',
      },
    ],
  },
  plugins: [
    // resolve to use joi-browser for client-side joi
    new webpack.NormalModuleReplacementPlugin(/^joi$/, path.resolve(__dirname, './node_modules/joi-browser')),
  ],
};
