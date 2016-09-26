import path from 'path';
import webpack from 'webpack';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import webpackMerge from 'webpack-merge'; // used to merge webpack configs
import commonConfig from './webpack.common.js'; // the settings that are common to prod and dev

// The path to find when @import is used in the scss file
const scssModulePaths = [
  '../node_modules',
].map(scssModulePath => `includePaths[]=${path.resolve(__dirname, scssModulePath)}`).join(',');

export default webpackMerge(commonConfig, {
  module: {
    loaders: [
      {
        test: /(\.css|\.scss)$/,
        loader: ExtractTextPlugin.extract('style', ['css', 'postcss', `sass?${scssModulePaths}`]),
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': { NODE_ENV: '"production"' },
    }),
    new ExtractTextPlugin('style.css'),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin(),
  ],
});
