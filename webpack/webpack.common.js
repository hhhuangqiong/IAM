import path from 'path';
import webpack from 'webpack';
import cssnext from 'postcss-cssnext';
import { getSupportedLangs } from '../src/utils/intl';
import pkg from '../package.json';

// For remove unused locale data
const langStrRegex = new RegExp(getSupportedLangs().join('|', 'i'));

export default {
  entry: {
    login: ['babel-polyfill', path.resolve(__dirname, '../src/client/login')],
    resetPassword: ['babel-polyfill', path.resolve(__dirname, '../src/client/resetPassword')],
    setPassword: ['babel-polyfill', path.resolve(__dirname, '../src/client/setPassword')],
  },
  output: {
    path: path.resolve(__dirname, '../public/assets/app'),
    filename: '[name].bundle.js',
    publicPath: '/assets/app/',
  },
  resolve: {
    alias: {
      react: path.resolve(__dirname, '../node_modules/react'),
      'react/addons': path.resolve(__dirname, '../node_modules/react/addons'),
    },
    extensions: ['', '.js', '.jsx', '.json'],
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        include: [
          path.resolve(__dirname, '../src'),
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
    new webpack.NormalModuleReplacementPlugin(/^joi$/, path.resolve(__dirname, '../node_modules/joi-browser')),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.optimize.CommonsChunkPlugin('common.bundle.js'),
    new webpack.DefinePlugin({
      VERSION: JSON.stringify(pkg.version),
    }),
  ],
  postcss: () => [
    cssnext({ browsers: ['last 2 versions'] }),
  ],
};
