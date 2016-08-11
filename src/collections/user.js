import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import Q from 'q';
import isUndefined from 'lodash/isUndefined';
import timestamp from 'mongoose-timestamp';
import randtoken from 'rand-token';

import { toJSON } from '../utils/mongoose';

function hashPassword(password) {
  const salt = bcrypt.genSaltSync(10);
  return Q.ninvoke(bcrypt, 'hash', password, salt)
    .then(hashedPassword => ({
      salt,
      hashedPassword,
    }));
}

const schema = new mongoose.Schema({
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
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
  },
  assignedCompanies: [{
    _id: false,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
  }],
  tokens: [{
    _id: false,
    event: String,
    value: mongoose.Schema.Types.Mixed,
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

schema.pre('save', function preSave(next) {
  // do nothing when password is not set
  if (isUndefined(this.password)) {
    next();
    return;
  }
  // encrpyted the password
  hashPassword(this.password).then(hashResult => {
    this.salt = hashResult.salt;
    this.hashedPassword = hashResult.hashedPassword;
    next();
  }).done();
});

schema.method('isValidPassword', function isValidPassword(password) {
  return this.hashedPassword && bcrypt.compareSync(password, this.hashedPassword);
});

schema.static('hashPassword', hashPassword);

schema.static('makeToken', (event, val) => ({
  event,
  value: val || randtoken.generate(16),
  createdAt: new Date(),
}));

export const User = mongoose.model('User', schema);
export default User;
