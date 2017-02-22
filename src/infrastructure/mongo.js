import { check } from 'm800-util';
import Joi from 'joi';
import mongoose from 'mongoose';
import Promise from 'bluebird';

export function createMongooseConnection(logger, mongoOptions) {
  check.ok('logger', logger);
  check.schema('mongoOptions', mongoOptions, Joi.object({
    uri: Joi.string().required(),
    options: Joi.object().allow(null),
  }));

  // set up the mongoose Promise to use q.
  mongoose.Promise = Promise;

  const { uri, options } = mongoOptions;
  const connection = mongoose.createConnection(uri, options);
  const mongooseEvent = ['open', 'connecting', 'connected', 'reconnected', 'disconnected', 'close', 'fullsetup'];
  mongooseEvent.forEach(evt => {
    connection.on(evt, () => {
      logger.info(`Mongoose connection is ${evt}.`);
    });
  });

  connection.on('error', error => {
    logger.error(`Error connecting to MongoDB [${uri}]: ${error.message}`, error);
  });

  // monitor the replicaset
  if (connection.db.serverConfig.s.replset) {
    ['joined', 'left'].forEach(evt => {
      connection.db.serverConfig.s.replset.on(evt, (type, serverObj) => {
        logger.info(`Replica set event ${type} ${evt} received
          ${serverObj.ismaster ? ' from master' : ''}`, serverObj);
      });
    });

    connection.db.serverConfig.s.replset.on('error', error => {
      logger.error(`Replica set error: ${error.message}`, error);
    });
  }

  return Promise.promisifyAll(connection);
}

export default createMongooseConnection;
