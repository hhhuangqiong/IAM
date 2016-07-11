import http from 'http';
import logger from 'winston';
import healthcheck from 'm800-health-check';
import mongoose from 'mongoose';

import { createServer } from './server';

const env = process.env.NODE_ENV || 'development';
const port = process.env.PORT || '3000';

const app = createServer(env);

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
