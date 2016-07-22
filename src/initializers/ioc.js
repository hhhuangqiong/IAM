import bottle from 'bottlejs';
import database from './database';
import nconf from 'nconf';
import Q from 'q';
import mongoose from 'mongoose';
import Grid from 'gridfs-stream';

export default function initialize() {
  const ioc = bottle(nconf.get('containerName'));
   // mongodb
  ioc.service('mongoose', () => {
    database(nconf.get('mongodb:uri'), nconf.get('mongodb:options'));

    // set up the mongoose Promise to use q.
    mongoose.Promise = Q.Promise;
  });

  ioc.service('gridfs', () => {
    const db = mongoose.connection.db;
    const mongoDriver = mongoose.mongo;
    return new Grid(db, mongoDriver);
  });
  return ioc;
}
