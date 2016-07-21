import mongoose from 'mongoose';
import timestamp from 'mongoose-timestamp';

import * as gridFs from '../utils/gridfs';

const COLLECTION_NAME = 'Company';

const schema = new mongoose.Schema({
  parent: {
    ref: COLLECTION_NAME,
    type: mongoose.Schema.Types.ObjectId,
  },
  id: {
    type: String,
    unique: true,
    required: true,
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
    type: mongoose.Schema.Types.ObjectId,
  },
  updatedBy: {
    ref: 'User',
    type: mongoose.Schema.Types.ObjectId,
  },
}, {
  collection: COLLECTION_NAME,
  toJSON: {
    transform: (doc, ret) => {
      /* eslint no-param-reassign: ["error", { "props": false }]*/
      Object.keys(ret).forEach(key => {
        if (Array.isArray(ret[key]) && !ret[key].length) {
          delete ret[key];
        }
      });
    },
  },
});

schema.plugin(timestamp);

/* eslint no-underscore-dangle: ["error", { "allow": ["fileDoc", "_id"] }] */
schema.method('addLogo', function addLogo(filePath, options = {}) {
  // set unlinkFile to true which removes file after storing into mongodb
  return gridFs.addFile(filePath, Object.assign(options, { unlinkFile: true }))
        .then((fileDoc) => {
          this.logo = fileDoc._id;
          return this.save().then(() => this.logo);
        });
});

schema.method('removeLogo', function removeLogo() {
  return gridFs.removeFile(this.logo).then(() => {
    this.logo = undefined;
    return this.save();
  });
});

schema.static('getLogo', (id) => gridFs.getById(id));

const company = mongoose.model(COLLECTION_NAME, schema);

export default company;
