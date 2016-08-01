import express from 'express';
import bodyParser from 'body-parser';
import methodOverride from 'method-override';
import logger from 'winston';

import injectExpress from './express';
import injectKoa from './koa';
import ioc from './utils/ioc';
import database from './initializers/database';
import { errorHandler } from './initializers/errorHandler';

let app;
export function createServer() {
  if (app) {
    return app;
  }
  // set up the container
  const bottle = ioc.initialize();

  // connect to the db when server start
  const { config } = bottle.container;
  const connection = database(config.get('mongodb:uri'), config.get('mongodb:options'));
  logger.info(`Connect to the mongoose ${connection.readyState}`);

  app = express();

  // share express settings
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({
    extended: true,
  }));

  // To enable using PUT, DELETE METHODS
  app.use(methodOverride('_method'));

  injectExpress(app);
  injectKoa(app);

   // set up express error handler
  errorHandler({
    app,
    logger,
  });

  return app;
}
