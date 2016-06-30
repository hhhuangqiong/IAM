import http from 'http';
import logger from 'winston';

import config from './config';
import expressApp from './express';
import koaApp from './koa';

const OPENID_PREFIX = '/openid';

// mount the koa on top of the express
expressApp.use(OPENID_PREFIX, koaApp.callback());

// start the server
const server = http.createServer(expressApp);

server.listen(config.APP_PORT, () => {
  logger.info('Server listening on %d', config.APP_PORT);
});
