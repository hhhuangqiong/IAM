import bottle from 'bottlejs';
import database from './database';
import nconf from 'nconf';

export default function initialize() {
  const ioc = bottle(nconf.get('containerName'));
   // mongodb
  ioc.service('mongoose', () =>
    database(nconf.get('mongodb:uri'), nconf.get('mongodb:options')));

  return ioc;
}
