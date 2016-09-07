import express from 'express';
import logger from 'winston';
import Q from 'q';
import morgan from 'morgan';

import injectExpress from './express';
import injectKoa from './koa';
import ioc from './utils/ioc';
import database from './initializers/database';
import { errorHandler } from './initializers/errorHandler';

let app;
export function createServer() {
  if (app) {
    return Q.resolve(app);
  }
  // set up the container
  const bottle = ioc.initialize();

  // connect to the db when server start
  const { config } = bottle.container;
  const connection = database(config.get('mongodb:uri'), config.get('mongodb:options'));
  logger.info(`Connect to the mongoose ${connection.readyState}`);

  app = express();
  // apply the development logger middleware
  app.use(morgan('dev'));

  // wait until both services are ready
  return Q.all([injectExpress(app), injectKoa(app)])
    .then(() => {
      // set up express error handler
      errorHandler({
        app,
        logger,
      });

      // set up dev config
      if (process.env.ENABLE_WEBPACK_HOTLOADER === 'true') {
        require('./initializers/devHotloader')(app); // eslint-disable-line global-require
      }

      return app;
    });
}
