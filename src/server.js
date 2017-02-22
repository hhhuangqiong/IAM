import express from 'express';
import morgan from 'morgan';
import path from 'path';
import { createEngine } from 'express-react-views';
import metricsMiddleware from 'm800-prometheus-express';
import { check } from 'm800-util';
import healthCheck from 'm800-health-check';
import { createLocaleDetectionMiddleware } from 'm800-user-locale';

export function createServer(logger, api, mongooseConnection, serverOptions, LOCALES, ENV) {
  check.ok('logger', logger);
  check.ok('api', api);
  check.ok('mongooseConnection', mongooseConnection);
  check.members('serverOptions', serverOptions, ['env', 'port']);
  check.ok('LOCALES', LOCALES);
  check.ok('ENV', ENV);

  // test is applied when running test cases
  const isDevelopment = ENV !== 'production' && ENV !== 'test';

  const server = express();
  server.use(metricsMiddleware());
  server.use(morgan('common'));
  healthCheck(server, {
    mongodb: {
      mongoose: mongooseConnection,
    },
  });

  // set the user locale and template engine on server
  server.use(createLocaleDetectionMiddleware({
    locales: LOCALES,
  }));
  server.set('views', path.resolve(__dirname, './client/views'));
  server.set('view engine', 'js');
  server.engine('js', createEngine({ transformViews: false }));

  // set up dev config for webpack
  if (isDevelopment) {
    logger.debug('inject webpack hot reload');
    require('./webpackDev').injectWebpackDev(server); // eslint-disable-line global-require
  }

  // set up the static resource
  // if webpack development is enabled, those resources will be consumed in the webpack middleware
  server.use(express.static(path.join('public/')));

  server.use(api);

  return {
    start: () => {
      server.listen(serverOptions.port);
      logger.debug(`Server is listening at port ${serverOptions.port}...`);
      return server;
    },
  };
}

export function register(container) {
  container.service('server', createServer, 'logger', 'api', 'mongooseConnection', 'serverOptions', 'LOCALES', 'ENV');
  return container;
}

export default register;
