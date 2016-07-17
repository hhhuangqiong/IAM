import bcrypt from 'bcrypt';
// import moment from 'moment';
import mongoose from 'mongoose';
// import randtoken from 'rand-token';
import Q from 'q';
import timestamp from 'mongoose-timestamp';


const COLLECTION_NAME = 'User';

const userSchema = new mongoose.Schema({
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
  hashedPassword: String,
  salt: String,
  emails: [{
    primary: Boolean,
    type: String,
    display: String,
    value: String,
    verified: Boolean,
  }],
  phoneNumbers: [{
    primary: Boolean,
    value: String,
    display: String,
    type: String,
    verified: Boolean,
  }],
  ims: [{
    primary: Boolean,
    value: String,
    display: String,
    type: String,
  }],
  photos: [{
    primary: Boolean,
    value: String,
    display: String,
    type: String,
  }],
  addresses: [{
    formatted: String,
    streetAddress: String,
    locality: String,
    region: String,
    postalCode: String,
    country: String,
    type: String,
  }],
  entitlements: [{
    primary: Boolean,
    value: String,
    display: String,
    type: String,
  }],
  x509Certificates: [{
    primary: Boolean,
    value: String,
    display: String,
    type: String,
  }],

  gender: String,
  birthdate: String,
  website: String,

  affiliatedCompany: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
  },
  assignedCompanies: [{
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
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  collection: COLLECTION_NAME,
});

userSchema.plugin(timestamp);

userSchema.pre('save', function preSave(next) {
  if (this.hashedPassword && !this.password) {
    next();
    return;
  }

  if (this.password) {
    const hashPasswordCb = (err, hashResult) => {
      this.salt = hashResult.salt;
      this.hashedPassword = hashResult.hashedPassword;
      next();
    };

    this.constructor.hashInfo(this.password, hashPasswordCb);
    return;
  }

  next();
});

userSchema.method('isValidPassword', function isValidPassword(password) {
  return bcrypt.compareSync(password, this.hashedPassword);
});

userSchema.static('hashInfo', (password) => {
  // use default rounds for now
  const salt = bcrypt.genSaltSync(10);
  return Q.ninvoke(bcrypt, 'hash', password, salt)
    .then(hash => ({
      hashedPassword: hash,
      salt,
    }));
});

const user = mongoose.model(COLLECTION_NAME, userSchema);
export default user;
