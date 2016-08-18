import _ from 'lodash';
import { NotFoundError, ValidationError, Error } from 'common-errors';
import Joi from 'joi';
import moment from 'moment';

import { rename, mongoose as mongooseUtil, jsonPatch } from '../../../utils';
import {
  DEFAULT_PAGE_SIZE,
  DEFAULT_PAGE_NO,
  DEFAULT_USER_SORT_BY,
  DEFAULT_SORT_ORDER,
} from '../../../constants/param';

const SET_PW_TOKEN = 'setPassword';
const RESET_PW_TOKEN = 'resetPassword';

const objectIdRegExp = /^[0-9a-fA-F]{24}$/;
export function userService(validator, { User, Company }, mailService) {
  const baseInfoSchema = Joi.object({
    name: Joi.object({
      formatted: Joi.string(),
      familyName: Joi.string(),
      givenName: Joi.string(),
      middleName: Joi.string(),
      honorificPrefix: Joi.string(),
      honorificSuffix: Joi.string(),
    }),
    password: Joi.string(),
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
    affiliatedCompany: Joi.string().regex(objectIdRegExp),
    assignedCompanies: Joi.array().items(Joi.string().regex(objectIdRegExp)),
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
    id: Joi.string().email().required(),
    isRoot: Joi.boolean().default(false),
    active: Joi.boolean().default(false),
    clientId: Joi.string(),
    redirectURL: Joi.string(),
  });

  function* createUser(command) {
    const sanitizedCommand = validator.sanitize(command, createUserCommandSchema);
    // verify the company id
    yield validateCompanies(sanitizedCommand);

    let user;
    let token;
    try {
      user = yield User.create(sanitizedCommand);
    } catch (e) {
      throw mongooseUtil.errorHandler(e);
    }
    try {
      // create sign up tokens
      token = yield mailService.sendSignUpEmail(user._id, {
        clientId: sanitizedCommand.clientId,
        redirectURL: sanitizedCommand.redirectURL,
      });
    } catch (e) {
      throw new Error(`Failed to deliver email to ${user._id}`);
    }

    try {
      user.tokens.push(User.makeToken(SET_PW_TOKEN, token));
      yield user.save();
      return user.toJSON();
    } catch (e) {
      throw mongooseUtil.errorHandler(e);
    }
  }

  const getUsersCommandSchema = baseInfoSchema.keys({
    id: Joi.string().email(),
    isRoot: Joi.boolean(),
    active: Joi.boolean(),
    affiliatedCompany: Joi.string().regex(objectIdRegExp),
    page: Joi.number().positive().default(DEFAULT_PAGE_NO),
    pageSize: Joi.number().positive().default(DEFAULT_PAGE_SIZE),
    sortBy: Joi.string().default(DEFAULT_USER_SORT_BY),
    sortOrder: Joi.string().valid('asc', 'desc').default(DEFAULT_SORT_ORDER),
    search: Joi.string(),
    ids: Joi.string(),
  }).without('id', ['ids', 'search']) // id, ids or seach can't exist together
  .without('ids', 'search');

  function* getUsers(command) {
    const sanitizedCommand = validator.sanitize(command, getUsersCommandSchema);
    let filters = _.omit(sanitizedCommand, ['sortBy', 'sortOrder', 'page', 'pageSize']);
    // search will perform search by id
    // perform search by id contain the filter param which similar to SQL like
    if (filters.search) {
      try {
        filters.id = new RegExp(`.*${filters.search}.*`, 'i');
        delete filters.search;
      } catch (ex) {
        throw new ValidationError('invalid search');
      }
    } else if (filters.ids) {
      filters.id = {
        $in: filters.ids.split(','),
      };
      delete filters.ids;
    }
    // update the filter with the _id key
    filters = rename(filters, { id: '_id' });
    let sort = {};
    sort[sanitizedCommand.sortBy] = sanitizedCommand.sortOrder;
    // update the sortBy with the _id key
    sort = rename(sort, { id: '_id' });
    const users = yield User.find(filters)
      .skip((sanitizedCommand.page - 1) * sanitizedCommand.pageSize)
      .limit(sanitizedCommand.pageSize)
      .sort(sort);
    const total = yield User.find(filters).count();
    return {
      total,
      pageTotal: Math.ceil(total / sanitizedCommand.pageSize),
      page: sanitizedCommand.page,
      pageSize: sanitizedCommand.pageSize,
      users: users.map((user) => user.toJSON()),
    };
  }

  const getUserCommandSchema = Joi.object({
    id: Joi.string().email().required(),
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
    id: Joi.string().email().required(),
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
    id: Joi.string().email().required(),
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
      'password', 'hashedPassword', 'salt', 'displayName', 'tokens', 'isVerified']);
    const additional = _.difference(userInfo, _.keys(sanitizedCommand));
    // remove extra keys that aren't set
    _(additional).each(key => _.set(user, key, undefined));
    // update the data
    _(sanitizedCommand).omit('id').each((value, key) => _.set(user, key, value));
    yield user.save();
    return null;
  }

  const patchUserCommandSchema = Joi.object({
    id: Joi.string().email().required(),
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
        'password', 'hashedPassword', 'salt', 'displayName', 'tokens', 'isVerified']);
      // always set password to be empty string
      currentUser.password = '';
    }

    // apply patches to the company
    jsonPatch(currentUser, sanitizedCommand.patches);
    // create a new user when fail to find existing one
    if (!user) {
      return yield createUser(currentUser);
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

  const verifyPasswordCommandSchema = Joi.object({
    id: Joi.string().email().required(),
    password: Joi.string().required(),
  });

  function* verifyPassword(command) {
    const sanitizedCommand = validator.sanitize(command, verifyPasswordCommandSchema);
    const user = yield User.findOne({ _id: sanitizedCommand.id });
    if (!user) {
      throw new NotFoundError('user');
    }
    const result = user.isValidPassword(sanitizedCommand.password);
    if (!result) {
      throw new ValidationError('password');
    }
    return result;
  }

  const setPasswordCommandSchema = Joi.object({
    id: Joi.string().email().required(),
    token: Joi.string().required(),
    password: Joi.string().required(),
    event: Joi.string().valid(RESET_PW_TOKEN, SET_PW_TOKEN).required(),
  });

  function* setPassword(command) {
    const sanitizedCommand = validator.sanitize(command, setPasswordCommandSchema);
    const user = yield User.findOne({ _id: sanitizedCommand.id });
    if (!user) {
      throw new NotFoundError('user');
    }
    const tokenSet = _.find(user.tokens, token => token.event === sanitizedCommand.event
      && token.value === sanitizedCommand.token);
    if (!tokenSet) {
      throw new ValidationError('invalid token');
    }
    // consume the token
    user.tokens = _.without(user.tokens, tokenSet);
    // SET password has no expiration time
    if (sanitizedCommand.event === RESET_PW_TOKEN) {
      const hoursBefore = moment(moment()).diff(tokenSet.createdAt, 'hours');
      if (hoursBefore >= 3) {
        // save the consumed status before throw exception
        yield user.save();
        throw new ValidationError('token is expired');
      }
    }

    // set the password
    user.password = sanitizedCommand.password;
    yield user.save();
  }

  const resetPasswordCommandSchema = Joi.object({
    id: Joi.string().email().required(),
    clientId: Joi.string(),
    redirectURL: Joi.string(),
  });

  function* requestResetPassword(command) {
    const sanitizedCommand = validator.sanitize(command, resetPasswordCommandSchema);
    const user = yield User.findOne({ _id: sanitizedCommand.id });
    if (!user) {
      throw new NotFoundError('user');
    }
    // remove previous reset pw token and create reset pw token
    user.tokens = _.reject(user.tokens, token => token.event === RESET_PW_TOKEN);
    // cancel the current password
    user.password = undefined;
    let token;

    try {
      token = yield mailService.sendResetPasswordEmail(sanitizedCommand.id, {
        clientId: sanitizedCommand.clientId,
        redirectURL: sanitizedCommand.redirectURL,
      });
    } catch (e) {
      throw new Error(`Failed to deliver email to ${sanitizedCommand.id}`);
    }

    const tokenSet = User.makeToken(RESET_PW_TOKEN, token);
    user.tokens.push(tokenSet);
    yield user.save();
  }

  return {
    createUser,
    getUsers,
    getUser,
    deleteUser,
    setUserInfo,
    patchUserInfo,
    verifyPassword,
    setPassword,
    requestResetPassword,
  };
}
