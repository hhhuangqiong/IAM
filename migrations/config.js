require('babel-register');

const nconf = require('../src/initializers/nconf');

const config = nconf();

module.exports = {
  changelogCollectionName: 'changelog',
  mongodb: {
    url: config.get('mongodb:uri'),
  },
};
