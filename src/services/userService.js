import _ from 'lodash';
import { NotFoundError, ValidationError, InvalidOperationError,
  NotPermittedError, NotSupportedError } from 'common-errors';
import Joi from 'joi';
import moment from 'moment';
import { check } from 'm800-util';

import { rename, mongoose as mongooseUtil, validator } from './util';
import {
  DEFAULT_PAGE_SIZE,
  DEFAULT_PAGE_NO,
  DEFAULT_USER_SORT_BY,
  DEFAULT_SORT_ORDER,
} from './constants';

const SET_PW_TOKEN = 'setPassword';
const RESET_PW_TOKEN = 'resetPassword';

const objectIdRegExp = /^[0-9a-fA-F]{24}$/;
export function userService({ User, Company }, mailService, logger) {
  check.ok('Company', Company);
  check.ok('User', User);
  check.ok('mailService', mailService);
  check.ok('logger', logger);

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
  });

  async function validateCompany(companyId) {
    const company = await Company.findOne({ _id: companyId }).select('_id');
    if (!company) {
      throw new NotFoundError('company');
    }
  }

  async function validateCompanyForUniqueness(sanitizedCommand) {
    // verify the company id
    if (sanitizedCommand.affiliatedCompany) {
      await validateCompany(sanitizedCommand.affiliatedCompany);
    }
  }

  const createUserCommandSchema = baseInfoSchema.keys({
    id: Joi.string().email().required(),
    active: Joi.boolean().default(false),
  });

  async function createUser(command) {
    const sanitizedCommand = validator.sanitize(command, createUserCommandSchema);
    // verify the company id
    await validateCompanyForUniqueness(sanitizedCommand);

    let user;
    try {
      user = await User.create(sanitizedCommand);
    } catch (e) {
      throw mongooseUtil.errorHandler(e);
    }
    return user.toJSON();
  }

  const getUsersCommandSchema = baseInfoSchema.keys({
    id: Joi.string().email(),
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

  async function getUsers(command) {
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
    const users = await User.find(filters)
      .skip((sanitizedCommand.page - 1) * sanitizedCommand.pageSize)
      .limit(sanitizedCommand.pageSize)
      .sort(sort);
    const total = await User.find(filters).count();
    return {
      total,
      pageTotal: Math.ceil(total / sanitizedCommand.pageSize),
      page: sanitizedCommand.page,
      pageSize: sanitizedCommand.pageSize,
      items: users.map((user) => user.toJSON()),
    };
  }

  const getUserCommandSchema = Joi.object({
    id: Joi.string().email().required(),
  });

  async function getUser(command) {
    const sanitizedCommand = validator.sanitize(command, getUserCommandSchema);
    const user = await User.findOne({ _id: sanitizedCommand.id });
    if (!user) {
      throw new NotFoundError('user');
    }
    return user.toJSON();
  }

  const deleteUserCommandSchema = Joi.object({
    id: Joi.string().email().required(),
  });

  async function deleteUser(command) {
    const sanitizedCommand = validator.sanitize(command, deleteUserCommandSchema);
    const user = await User.findOne({ _id: sanitizedCommand.id });
    if (!user) {
      throw new NotFoundError('user');
    }
    if (user.isRoot) {
      throw new InvalidOperationError('root user cannot be deleted');
    }
    await user.remove();
  }

  const updateUserCommandSchema = baseInfoSchema.keys({
    id: Joi.string().email().required(),
    active: Joi.boolean(),
  });

  async function setUserInfo(command) {
    const sanitizedCommand = validator.sanitize(command, updateUserCommandSchema);

    await validateCompanyForUniqueness(sanitizedCommand);

    const user = await User.findOneAndUpdate({ _id: sanitizedCommand.id },
      _.omit(sanitizedCommand, 'id'), { new: true, upsert: true });
    return user.toJSON();
  }

  const verifyPasswordCommandSchema = Joi.object({
    id: Joi.string().email().required(),
    password: Joi.string().required(),
  });

  async function verifyPassword(command) {
    const sanitizedCommand = validator.sanitize(command, verifyPasswordCommandSchema);
    const user = await User.findOne({ _id: sanitizedCommand.id });
    if (!user) {
      throw new NotFoundError('user');
    }
    const result = await user.isValidPassword(sanitizedCommand.password);
    if (!result) {
      throw new ValidationError('password');
    }
    return result;
  }

  const setPasswordCommandSchema = Joi.object({
    id: Joi.string().email().required(),
    token: Joi.string().required(),
    password: Joi.string().required().min(8)
      // both upper and lower
      .regex(/(?=.*[a-z])(?=.*[A-Z]).{2,}/)
      // number and symbol
      .regex(/[0-9!@#\$%\^&*\(\)]+/),
    event: Joi.string().valid(RESET_PW_TOKEN, SET_PW_TOKEN).required(),
  });

  async function setPassword(command) {
    const sanitizedCommand = validator.sanitize(command, setPasswordCommandSchema);
    const user = await User.findOne({ _id: sanitizedCommand.id });
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
        await user.save();
        throw new ValidationError('token is expired');
      }
    }
    user.password = sanitizedCommand.password;
    await user.save();
  }

  const resetPasswordCommandSchema = Joi.object({
    id: Joi.string().email().required(),
    clientId: Joi.string(),
    redirectURL: Joi.string(),
  });

  async function requestResetPassword(command) {
    const sanitizedCommand = validator.sanitize(command, resetPasswordCommandSchema);
    const user = await User.findOne({ _id: sanitizedCommand.id });
    if (!user) {
      throw new NotFoundError('user');
    }
    // remove previous reset pw token and create reset pw token
    user.tokens = _.reject(user.tokens, token => token.event === RESET_PW_TOKEN);
    // cancel the current password
    user.password = undefined;
    let token;

    try {
      token = await mailService.sendResetPasswordEmail(sanitizedCommand.id, {
        clientId: sanitizedCommand.clientId,
        redirectURL: sanitizedCommand.redirectURL,
        givenName: user.name.givenName,
      });
    } catch (e) {
      logger.warn(`Fail to deliver email to ${sanitizedCommand.id} %s`, e.message, e);
      throw new NotSupportedError(`Failed to deliver email to ${sanitizedCommand.id}`);
    }

    const tokenSet = User.makeToken(RESET_PW_TOKEN, token);
    user.tokens.push(tokenSet);
    await user.save();
  }

  const requestSetPasswordCommandSchema = baseInfoSchema.keys({
    id: Joi.string().email().required(),
    clientId: Joi.string(),
    redirectURL: Joi.string(),
  });

  async function requestSetPassword(command) {
    const sanitizedCommand = validator.sanitize(command, requestSetPasswordCommandSchema);
    const user = await User.findOne({ _id: sanitizedCommand.id });
    if (!user) {
      throw new NotFoundError('user');
    }

    if (user.isVerified) {
      throw new NotPermittedError('user has already verified and set password');
    }

    // remove previous set pw token and create set pw token
    user.tokens = _.reject(user.tokens, token => token.event === SET_PW_TOKEN);
    let token;
    try {
      // create sign up tokens
      token = await mailService.sendSignUpEmail(user._id, {
        clientId: sanitizedCommand.clientId,
        redirectURL: sanitizedCommand.redirectURL,
        givenName: user.name.givenName,
      });
    } catch (e) {
      // all the failure from mail service are conditions that not supported by application
      // other than target mail domain
      logger.warn(`Failed to deliver email to ${user.id} %s`, e.message, e);
      throw new NotSupportedError(`Failed to deliver email to ${user._id}`);
    }

    user.tokens.push(User.makeToken(SET_PW_TOKEN, token));
    await user.save();
  }

  return {
    createUser,
    getUsers,
    getUser,
    deleteUser,
    setUserInfo,
    verifyPassword,
    setPassword,
    requestResetPassword,
    requestSetPassword,
  };
}

export default userService;
