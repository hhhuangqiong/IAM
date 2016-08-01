import logger from 'winston';
import mongoose from 'mongoose';

/**
 * Initialize database connection
 *
 * @param {string} mongoURI MongoDB connection URI
 * @param {Object} mongoOpts MongoDB connection options
 * @returns {Object} the connection
 */
export default function initialize(mongodbURI, mongodbOpts = {}) {
  if (!mongodbURI) {
    throw new Error('Uri is required');
  }

  logger.info('Connecting to Mongo on %s', mongodbURI);
  mongoose.connect(mongodbURI, mongodbOpts);

  const connection = mongoose.connection;
  ['open', 'connected', 'disconnected', 'close'].forEach(evt => {
    connection.on(evt, () => {
      logger.info('mongoose connection', evt);
    });
  });

  connection.on('error', err => {
    logger.error(err);
  });

  process.on('SIGINT', () => {
    connection.close(() => {
      process.exit(0);
    });
  });

  return connection;
}
