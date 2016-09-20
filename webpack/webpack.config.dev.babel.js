import _ from 'lodash';
import path from 'path';
import webpack from 'webpack';
import webpackMerge from 'webpack-merge'; // used to merge webpack configs
import commonConfig from './webpack.common.js'; // the settings that are common to prod and dev

// The path to find when @import is used in the scss file
const scssModulePaths = [
  '../node_modules',
  '../node_modules/m800-web-styleguide/scss',
].map(scssModulePath => `includePaths[]=${path.resolve(__dirname, scssModulePath)}`).join(',');

_(commonConfig.entry).forEach((entry) => {
  entry.unshift('webpack-hot-middleware/client');
});

commonConfig.module.loaders[0].query = { presets: ['react-hmre'] };

export default webpackMerge(commonConfig, {
  devtool: 'eval-source-map',
  module: {
    loaders: [
      {
        test: /(\.css|\.scss)$/,
        loaders: ['style', 'css?sourceMap', 'postcss', `sass?sourceMap&${scssModulePaths}`],
      },
    ],
  },
  plugins: [
    new webpack.NoErrorsPlugin(),
    new webpack.HotModuleReplacementPlugin(),
  ],
});
