import mongoose, { Schema } from 'mongoose';
import mBcrypt from 'bcrypt';
import isUndefined from 'lodash/isUndefined';
import timestamp from 'mongoose-timestamp';
import randtoken from 'rand-token';
import { find } from 'lodash';
import { check } from 'm800-util';
import Promise from 'bluebird';

import { toJSON } from '../util';

const bcrypt = Promise.promisifyAll(mBcrypt);

async function hashPassword(password) {
  const salt = await bcrypt.genSaltAsync(10);
  const hashedPassword = await bcrypt.hashAsync(password, salt);
  return {
    salt,
    hashedPassword,
  };
}

const { Types } = Schema;

const schema = new Schema({
  isRoot: {
    type: Boolean,
    default: false,
  },
  _id: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  name: {
    formatted: String,
    familyName: String,
    givenName: String,
    middleName: String,
    honorificPrefix: String,
    honorificSuffix: String,
  },
  nickName: String,
  profileUrl: String,
  title: String,
  userType: String,
  preferredLanguage: String,
  locale: String,
  timezone: String,
  active: {
    type: Boolean,
    default: true,
  },
  hashedPassword: {
    type: String,
  },
  salt: {
    type: String,
  },
  emails: [{
    _id: false,
    primary: Boolean,
    display: String,
    value: String,
    verified: Boolean,
    type: {
      type: String,
    },
  }],
  phoneNumbers: [{
    _id: false,
    primary: Boolean,
    value: String,
    display: String,
    type: {
      type: String,
    },
    verified: Boolean,
  }],
  ims: [{
    _id: false,
    primary: Boolean,
    value: String,
    display: String,
    type: {
      type: String,
    },
  }],
  photos: [{
    _id: false,
    primary: Boolean,
    value: String,
    display: String,
    type: {
      type: String,
    },
  }],
  addresses: [{
    _id: false,
    formatted: String,
    streetAddress: String,
    locality: String,
    region: String,
    postalCode: String,
    country: String,
    type: {
      type: String,
    },
  }],
  x509Certificates: [{
    _id: false,
    primary: Boolean,
    value: String,
    display: String,
    type: {
      type: String,
    },
  }],
  gender: String,
  birthdate: String,
  website: String,
  affiliatedCompany: {
    type: Types.ObjectId,
    ref: 'Company',
  },
  tokens: [{
    _id: false,
    event: String,
    value: Types.Mixed,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
  createdBy: {
    type: String,
    ref: 'User',
  },
  updatedBy: {
    type: String,
    ref: 'User',
  },
}, {
  collection: 'User',
  toJSON,
  versionKey: false,
});

schema.plugin(timestamp);

schema.virtual('id')
  .get(function getId() {
    return this._id;
  })
  .set(function setId(id) {
    this._id = id;
  });

schema.virtual('password')
  .get(function getPassword() {
    return this.tempPassword;
  })
  .set(function setPassword(password) {
    this.tempPassword = password;
  });

schema.virtual('displayName')
  .get(function getDisplayName() {
    if (!this.name.givenName && !this.name.familyName) {
      return '';
    }
    return `${this.name.givenName} ${this.name.familyName}`;
  });

// to determine whether user has verified by consuming the set password token
// which was sent when creating user and removed when consumed.
schema.virtual('isVerified')
  .get(function isVerified() {
    return this.hashedPassword && !find(this.tokens, token => token.event === 'setPassword');
  });

schema.pre('save', async function preSave(next) {
  // do nothing when password is not set
  if (isUndefined(this.password)) {
    next();
    return;
  }
  // encrpyted the password
  const { salt, hashedPassword } = await hashPassword(this.password);
  this.salt = salt;
  this.hashedPassword = hashedPassword;
  next();
});

schema.method('isValidPassword', async function isValidPassword(password) {
  return this.hashedPassword && await bcrypt.compareAsync(password, this.hashedPassword);
});

schema.static('hashPassword', hashPassword);

schema.static('makeToken', (event, val) => ({
  event,
  value: val || randtoken.generate(16),
  createdAt: new Date(),
}));

export function createUserModel(mongooseConnection = mongoose) {
  check.ok('mongooseConnection', mongooseConnection);
  return mongooseConnection.model('User', schema);
}

export default createUserModel;
