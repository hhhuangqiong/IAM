import nconf from '../src/initializers/nconf';

const config = nconf();

module.exports = {
  changelogCollectionName: 'changelog',
  mongodb: {
    url: config.get('mongodb:uri'),
  },
};
