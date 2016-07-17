import express from 'express';
import bodyParser from 'body-parser';
import methodOverride from 'method-override';
import path from 'path';
import logger from 'winston';

import injectExpress from './express';
import injectKoa from './koa';

import nconf from './initializers/nconf';
import ioc from './initializers/ioc';

export function createServer(env) {
  // build up the nconf
  nconf(env, path.resolve(__dirname, './config'));
  // set up the container
  const bottle = ioc();
  const connection = bottle.container.mongoose;
  logger.info(`Connect to the monoose ${connection}`);

  const app = express();
  // share express settings
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({
    extended: true,
  }));

  // To enable using PUT, DELETE METHODS
  app.use(methodOverride('_method'));

  injectExpress(app);
  injectKoa(app);

  return app;
}
