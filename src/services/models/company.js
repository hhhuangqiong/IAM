import mongoose, { Schema } from 'mongoose';
import timestamp from 'mongoose-timestamp';
import { check } from 'm800-util';

import { toJSON } from '../util';

const { Types } = Schema;

const schema = new Schema({
  parent: {
    ref: 'Company',
    type: Types.ObjectId,
  },
  country: {
    type: String,
    required: true,
  },
  reseller: {
    type: Boolean,
    required: true,
    default: false,
  },
  name: String,
  logo: Types.ObjectId,
  themeType: String,
  address: {
    formatted: String,
    streetAddress: String,
    locality: String,
    region: String,
    postalCode: String,
    country: String,
  },
  active: {
    type: Boolean,
    default: true,
  },
  timezone: String,
  accountManager: String,
  businessContact: [{
    name: String,
    phone: String,
    email: String,
    // exclude _id in the array
    _id: false,
  }],
  technicalContact: [{
    name: String,
    phone: String,
    email: String,
    // exclude _id in the array
    _id: false,
  }],
  supportContact: [{
    name: String,
    phone: String,
    email: String,
    // exclude _id in the array
    _id: false,
  }],
  createdBy: {
    ref: 'User',
    type: String,
  },
  updatedBy: {
    ref: 'User',
    type: String,
  },
}, {
  collection: 'Company',
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

export function createCompanyModel(mongooseConnection = mongoose) {
  check.ok('mongooseConnection', mongooseConnection);
  return mongooseConnection.model('Company', schema);
}

export default createCompanyModel;
