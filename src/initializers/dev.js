import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import webpackConfig from '../../webpack/webpack.config.dev.babel';

export default function initialize(server) {
  const compiler = webpack(webpackConfig);
  server.use(webpackDevMiddleware(compiler, {
    noInfo: true,
    stats: 'minimal',
    publicPath: webpackConfig.output.publicPath,
  }));
  server.use(webpackHotMiddleware(compiler));
}
