import mongoose from 'mongoose';
import timestamp from 'mongoose-timestamp';

import { toJSON } from '../utils/mongoose';

const schema = new mongoose.Schema({
  parent: {
    ref: 'Company',
    type: String,
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
  logo: mongoose.Schema.Types.ObjectId,
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

export const Company = mongoose.model('Company', schema);
export default Company;
