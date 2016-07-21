import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import Q from 'q';
import timestamp from 'mongoose-timestamp';
import isUndefined from 'lodash/isUndefined';

function hashPassword(password) {
  const salt = bcrypt.genSaltSync(10);
  return Q.ninvoke(bcrypt, 'hash', password, salt)
    .then(hashedPassword => ({
      salt,
      hashedPassword,
    }));
}

const COLLECTION_NAME = 'User';
const schema = new mongoose.Schema({
  isRoot: {
    type: Boolean,
    default: false,
  },
  username: {
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
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
    },
    department: String,
  },
  assignedCompanies: [{
    _id: false,
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
    },
    department: String,
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
    type: mongoose.Schema.Types.ObjectId,
    ref: COLLECTION_NAME,
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: COLLECTION_NAME,
  },
}, {
  collection: COLLECTION_NAME,
  toObject: {
    virtuals: true,
  },
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      /* eslint no-param-reassign: ["error", { "props": false }]*/
      Object.keys(ret).forEach(key => {
        if (Array.isArray(ret[key]) && !ret[key].length) {
          delete ret[key];
        }
      });
      // delete id since username is the key, and_id is kept
      // which will send along with the request as an user indcation instead of public username
      delete ret.id;
    },
  },
});

schema.plugin(timestamp);

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
  return bcrypt.compareSync(password, this.hashedPassword);
});

schema.static('hashPassword', hashPassword);

const user = mongoose.model(COLLECTION_NAME, schema);
export default user;
