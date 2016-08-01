import http from 'http';
import logger from 'winston';
import healthcheck from 'm800-health-check';
import { createServer } from './server';
import { getContainer } from './utils/ioc' ;

const app = createServer();

const { config, mongoose } = getContainer();
const port = config.get('PORT');

// set up the health check
healthcheck(app, {
  mongodb: {
    mongoose,
  },
});

// start the server
http.createServer(app).listen(port, () => {
  logger.info('Server listening on %d', port);
});
