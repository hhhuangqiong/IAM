import _ from 'lodash';
import { NotFoundError, ValidationError } from 'common-errors';
import Joi from 'joi';

import { rename, mongoose as mongooseUtil, jsonPatch } from '../../../utils';
import {
  DEFAULT_PAGE_SIZE,
  DEFAULT_PAGE_NO,
  DEFAULT_USER_SORT_BY,
  DEFAULT_SORT_ORDER,
} from '../../../constants/param';

export function userService(validator, { User, Company }) {
  const baseInfoSchema = Joi.object({
    password: Joi.string(),
    name: Joi.object({
      formatted: Joi.string(),
      familyName: Joi.string(),
      givenName: Joi.string(),
      middleName: Joi.string(),
      honorificPrefix: Joi.string(),
      honorificSuffix: Joi.string(),
    }),
    nickName: Joi.string(),
    profileUrl: Joi.string(),
    title: Joi.string(),
    userType: Joi.string(),
    preferredLanguage: Joi.string(),
    locale: Joi.string(),
    timezone: Joi.string(),
    active: Joi.boolean(),
    emails: Joi.array().items(Joi.object({
      primary: Joi.boolean(),
      display: Joi.string(),
      value: Joi.string().email(),
      type: Joi.string(),
      verified: Joi.boolean(),
    })),
    phoneNumbers: Joi.array().items(Joi.object({
      primary: Joi.boolean(),
      display: Joi.string(),
      value: Joi.string(),
      type: Joi.string(),
      verified: Joi.boolean(),
    })),
    ims: Joi.array().items(Joi.object({
      primary: Joi.boolean(),
      display: Joi.string(),
      value: Joi.string(),
      type: Joi.string(),
    })),
    photos: Joi.array().items(Joi.object({
      primary: Joi.boolean(),
      display: Joi.string(),
      value: Joi.string(),
      type: Joi.string(),
    })),
    addresses: Joi.array().items(Joi.object({
      formatted: Joi.string(),
      streetAddress: Joi.string(),
      locality: Joi.string(),
      postalCode: Joi.string(),
      country: Joi.string(),
      type: Joi.string(),
    })),
    x509Certificates: Joi.array().items(Joi.object({
      primary: Joi.boolean(),
      display: Joi.string(),
      value: Joi.string(),
      type: Joi.string(),
      verified: Joi.boolean(),
    })),
    gender: Joi.string(),
    birthdate: Joi.string(),
    website: Joi.string(),
    affiliatedCompany: Joi.string(),
    assignedCompanies: Joi.array().items(Joi.string()),
  });

  function* validateCompany(companyId) {
    const company = yield Company.findOne({ _id: companyId }).select('_id');
    if (!company) {
      throw new NotFoundError('company');
    }
  }

  function* validateCompanies(sanitizedCommand) {
    // verify the company id
    if (sanitizedCommand.affiliatedCompany) {
      yield validateCompany(sanitizedCommand.affiliatedCompany);
    }

    _.map(sanitizedCommand.assignedCompanies, function* validateEachCompany(company) {
      yield validateCompany(company);
    });
  }

  const createUserCommandSchema = baseInfoSchema.keys({
    id: Joi.string().required(),
    isRoot: Joi.boolean().default(false),
    active: Joi.boolean().default(false),
  });

  function* createUser(command) {
    const sanitizedCommand = validator.sanitize(command, createUserCommandSchema);
    // verify the company id
    yield validateCompanies(sanitizedCommand);

    try {
      const user = yield User.create(sanitizedCommand);
      return user.toJSON();
    } catch (e) {
      throw mongooseUtil.errorHandler(e);
    }
  }

  const getUsersCommandSchema = baseInfoSchema.keys({
    id: Joi.string(),
    isRoot: Joi.boolean(),
    active: Joi.boolean(),
    pageNo: Joi.number().positive().default(DEFAULT_PAGE_NO),
    pageSize: Joi.number().positive().default(DEFAULT_PAGE_SIZE),
    sortBy: Joi.string().default(DEFAULT_USER_SORT_BY),
    sortOrder: Joi.string().valid('asc', 'desc').default(DEFAULT_SORT_ORDER),
  });

  function* getUsers(command) {
    const sanitizedCommand = validator.sanitize(command, getUsersCommandSchema);
    let filters = _.omit(sanitizedCommand, ['sortBy', 'sortOrder', 'pageNo', 'pageSize']);
    // update the filter with the _id key
    filters = rename(filters, { id: '_id' });
    let sort = {};
    sort[sanitizedCommand.sortBy] = sanitizedCommand.sortOrder;
    // update the sortBy with the _id key
    sort = rename(sort, { id: '_id' });
    const users = yield User.find(filters)
      .skip(sanitizedCommand.pageNo * sanitizedCommand.pageSize)
      .limit(sanitizedCommand.pageSize)
      .sort(sort);
    const total = yield User.find(filters).count();
    return {
      total,
      pageNo: sanitizedCommand.pageNo,
      pageSize: sanitizedCommand.pageSize,
      users: users.map((user) => user.toJSON()),
    };
  }

  const getUserCommandSchema = Joi.object({
    id: Joi.string().required(),
  });

  function* getUser(command) {
    const sanitizedCommand = validator.sanitize(command, getUserCommandSchema);
    const user = yield User.findOne({ _id: sanitizedCommand.id });
    if (!user) {
      throw new NotFoundError('user');
    }
    return user.toJSON();
  }

  const deleteUserCommandSchema = Joi.object({
    id: Joi.string().required(),
  });

  function* deleteUser(command) {
    const sanitizedCommand = validator.sanitize(command, deleteUserCommandSchema);
    const user = yield User.findOne({ _id: sanitizedCommand.id });
    if (!user) {
      throw new NotFoundError('user');
    }
    yield user.remove();
  }

  const updateUserCommandSchema = baseInfoSchema.keys({
    id: Joi.string().required(),
    isRoot: Joi.boolean(),
    active: Joi.boolean(),
  });

  function* setUserInfo(command) {
    const sanitizedCommand = validator.sanitize(command, updateUserCommandSchema);
    const user = yield User.findOne({ _id: sanitizedCommand.id });
    // create a new company when fail to find existing one
    if (!user) {
      return yield createUser(sanitizedCommand);
    }
    // update the user info
    yield validateCompanies(sanitizedCommand);

    // pull the internal properties
    const userInfo = _.difference(_.keys(user.toJSON()),
      ['createdAt', 'updatedAt', 'createdBy', 'updatedBy',
      'password', 'hashedPassword', 'salt', 'displayName', 'tokens']);
    const additional = _.difference(userInfo, _.keys(sanitizedCommand));
    // remove extra keys that aren't set
    _(additional).each(key => _.set(user, key, undefined));
    // update the data
    _(sanitizedCommand).omit('id').each((value, key) => _.set(user, key, value));
    yield user.save();
    return null;
  }

  const patchUserCommandSchema = Joi.object({
    id: Joi.string().required(),
    patches: Joi.array().items(),
  });

  function* patchUserInfo(command) {
    let sanitizedCommand = validator.sanitize(command, patchUserCommandSchema);
    const user = yield User.findOne({ _id: sanitizedCommand.id });
    let currentUser;
    // default company will contain id
    if (!user) {
      currentUser = {
        id: sanitizedCommand.id,
      };
    } else {
      // ignore internal properties
      currentUser = _.omit(user.toJSON(),
       ['createdAt', 'updatedAt', 'createdBy', 'updatedBy',
        'password', 'hashedPassword', 'salt', 'displayName', 'tokens']);
      // always set password to be empty string
      currentUser.password = '';
    }

    // apply patches to the company
    jsonPatch(currentUser, sanitizedCommand.patches);
    // create a new user when fail to find existing one
    if (!user) {
      return yield yield createUser(currentUser);
    }

    // if password still empty, no need to update
    if (currentUser.password === '') {
      currentUser = _.omit(currentUser, 'password');
    }
    // validate the change after the json patches
    sanitizedCommand = validator.sanitize(currentUser, updateUserCommandSchema);
    // update the values when patch successfully
    _(sanitizedCommand).omit('id')
      .each((value, key) => _.set(user, key, value));
    yield user.save();
    return null;
  }

  function* verifyPassword(id, password) {
    const user = yield User.findOne({ _id: id });
    if (!user) {
      throw new NotFoundError('user');
    }
    const result = user.isValidPassword(password);
    if (!result) {
      throw new ValidationError('password');
    }
    return result;
  }

  return {
    createUser,
    getUsers,
    getUser,
    deleteUser,
    setUserInfo,
    patchUserInfo,
    verifyPassword,
  };
}
