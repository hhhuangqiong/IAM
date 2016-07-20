import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
// import randtoken from 'rand-token';
import Q from 'q';
import timestamp from 'mongoose-timestamp';

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
  displayName: String,
  nickName: String,
  profileUrl: String,
  title: String,
  userType: String,
  preferredLanguage: String,
  locale: String,
  timezone: String,
  active: Boolean,
  hashedPassword: {
    type: String,
  },
  salt: {
    type: String,
  },
  emails: [{
    _id: false,
    primary: Boolean,
    type: String,
    display: String,
    value: String,
    verified: Boolean,
  }],
  phoneNumbers: [{
    _id: false,
    primary: Boolean,
    value: String,
    display: String,
    type: String,
    verified: Boolean,
  }],
  ims: [{
    _id: false,
    primary: Boolean,
    value: String,
    display: String,
    type: String,
  }],
  photos: [{
    _id: false,
    primary: Boolean,
    value: String,
    display: String,
    type: String,
  }],
  addresses: [{
    _id: false,
    formatted: String,
    streetAddress: String,
    locality: String,
    region: String,
    postalCode: String,
    country: String,
    type: String,
  }],
  entitlements: [{
    _id: false,
    primary: Boolean,
    value: String,
    display: String,
    type: String,
  }],
  x509Certificates: [{
    _id: false,
    primary: Boolean,
    value: String,
    display: String,
    type: String,
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
});

schema.plugin(timestamp);

schema.virtual('password')
  .get(function getPassword() {
    return this.tempPassword;
  })
  .set(function setPassword(password) {
    this.tempPassword = password;
  });


schema.pre('save', function preSave(next) {
  // do nothing when password is not set
  if (!this.password) {
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
