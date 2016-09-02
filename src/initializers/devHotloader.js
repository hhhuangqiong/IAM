import _ from 'lodash';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import webpackConfig from '../../webpack.config';

export default function initialize(server) {
  _(webpackConfig.entry).forEach((entry) => {
    entry.unshift('webpack-hot-middleware/client');
  });

  webpackConfig.plugins.push(
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin()
  );

  const compiler = webpack(webpackConfig);
  server.use(webpackDevMiddleware(compiler, { noInfo: true, publicPath: webpackConfig.output.publicPath }));
  server.use(webpackHotMiddleware(compiler));
}
