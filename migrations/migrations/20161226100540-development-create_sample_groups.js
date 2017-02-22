import mongoose from 'mongoose';
import _ from 'lodash';
import Promise from 'bluebird';
import { defineMigration } from 'm800-util';

const env = process.env.DEPLOY_ENV || 'development';
const isRelease = process.env.NODE_ENV === 'production';
const isDevelopment = env === 'development' && !isRelease;

const ObjectId = mongoose.mongo.ObjectId;

module.exports = defineMigration(async (db) => {
  if (!isDevelopment) {
    return;
  }
  // eslint-disable-next-line global-require
  const faker = require('faker');

  const company = {
    _id: new ObjectId(),
    country: 'cn',
    reseller: false,
    name: 'CWG (Company With Groups)',
    themeType: null,
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const users = _.times(5, () => {
    const firstName = faker.name.firstName();
    const lastName = faker.name.lastName();
    return {
      _id: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@cwg.com`,
      name: {
        givenName: firstName,
        familyName: lastName,
      },
      isRoot: false,
      displayName: `${firstName} ${lastName}`,
      affiliatedCompany: company._id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });
  const groups = _.times(2, i => ({
    _id: new ObjectId(),
    name: `cwg-group-${i + 1}`,
    company: company._id,
    service: 'wlp',
    users: _(users)
      .shuffle()
      .take(2)
      .map(u => u._id)
      .value(),
    createdAt: new Date(),
    updatedAt: new Date(),
  }));

  await Promise.all([
    db.collection('Company').insert(company),
    db.collection('User').insert(users),
    db.collection('Group').insert(groups),
  ]);
});
