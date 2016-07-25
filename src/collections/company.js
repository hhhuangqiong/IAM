import mongoose from 'mongoose';
import timestamp from 'mongoose-timestamp';

import * as gridFs from '../utils/gridfs';
import mongooseToJSON from '../utils/mongooseToJSON';

const COLLECTION_NAME = 'Company';

const schema = new mongoose.Schema({
  parent: {
    ref: COLLECTION_NAME,
    type: String,
  },
  _id: {
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
    type: String,
  },
  updatedBy: {
    ref: 'User',
    type: String,
  },
}, {
  collection: COLLECTION_NAME,
  toJSON: mongooseToJSON,
});

schema.plugin(timestamp);

/* eslint no-underscore-dangle: ["error", { "allow": ["_id"] }] */
schema.virtual('id')
  .get(function getId() {
    return this._id;
  })
  .set(function setId(id) {
    this._id = id;
  });

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
