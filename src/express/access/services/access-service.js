import _ from 'lodash';
import Joi from 'joi';
import { NotFoundError, ValidationError } from 'common-errors';

import { combinePermissions } from './combine-permissions';
import { rename } from './../../../utils';


export function accessService(validator, { Role, Company, User }) {
  const permissionsSchema = Joi.object().pattern(/.+/, Joi.array().items(Joi.string()));

  const createRoleCommandSchema = Joi.object().keys({
    name: Joi.string(),
    company: Joi.string(),
    service: Joi.string(),
    permissions: permissionsSchema.optional(),
  }).options({
    presence: 'required',
  });

  function* createRole(command) {
    const sanitizedCommand = validator.sanitize(command, createRoleCommandSchema);
    const companyId = sanitizedCommand.company;
    const company = yield Company.findById(companyId).select('_id');
    if (!company) {
      throw new NotFoundError('Company');
    }
    try {
      const role = yield Role.create(sanitizedCommand);
      const json = _.omit(role.toJSON(), 'users');
      return rename(json, { _id: 'id' });
    } catch (e) {
      if (e.code === 11000) {
        throw new ValidationError('Combination of service, company and role name should be unique');
      }
      throw e;
    }
  }

  const getRolesQuerySchema = Joi.object({
    users: Joi.string().allow([null, '']).optional(),
    service: Joi.string().allow([null, '']).optional(),
    company: Joi.string().allow([null, '']).optional(),
  }).rename('username', 'users');

  function* getRoles(query) {
    const sanitizedQuery = validator.sanitize(query, getRolesQuerySchema);
    let filters = _.pickBy(sanitizedQuery, x => _.isString(x) && x.length > 0);
    // isRoot handling
    if (filters.users) {
      // determine whether user is root and return all the roles
      const user = yield User.findById(filters.users).select('isRoot');
      if (!user) {
        throw new NotFoundError('User');
      }
      if (user.isRoot) {
        // get all the roles based on the service or company
        filters = _.omit(filters, 'users');
      }
    }
    const roles = yield Role.find(filters).lean().select('-users');
    return roles.map(x => rename(x, { _id: 'id' }));
  }

  const deleteRoleCommandSchema = Joi.object({
    roleId: Joi.string().required(),
  });

  function* deleteRole(command) {
    const sanitizedCommand = validator.sanitize(command, deleteRoleCommandSchema);
    yield Role.remove({ _id: sanitizedCommand.roleId });
  }

  const updateRoleCommandSchema = createRoleCommandSchema
    .keys({ id: Joi.string().required() })
    .rename('roleId', 'id', { override: true });

  function* updateRole(command) {
    const sanitizedCommand = validator.sanitize(command, updateRoleCommandSchema);
    const company = yield Company.findById(sanitizedCommand.company);
    if (!company) {
      throw new NotFoundError('Company');
    }
    const role = yield Role.findOneAndUpdate(
      { _id: sanitizedCommand.id },
      { $set: _.omit(sanitizedCommand, 'id') },
      { new: true }
    ).select('-users');
    if (!role) {
      throw new NotFoundError('Role');
    }
    return rename(role.toJSON(), { _id: 'id' });
  }

  const getUserPermissionsQuerySchema = Joi.object({
    username: Joi.string().required(),
    service: Joi.string().allow(['', null]).optional(),
    company: Joi.string().allow(['', null]).optional(),
  });

  function* getUserPermissions(query) {
    const sanitizedQuery = validator.sanitize(query, getUserPermissionsQuerySchema);
    // root handling
    // determine whether user is root and return all the permission
    const user = yield User.findById(sanitizedQuery.username).select('isRoot');
    if (!user) {
      throw new NotFoundError('User');
    }
    const filters = _(sanitizedQuery)
      .omit('username')
      .pickBy(x => _.isString(x) && x.length > 0)
      .value();
    let mongoQuery;
    // root user will exclude the user name in query
    if (user.isRoot) {
      mongoQuery = filters;
    } else {
      mongoQuery = _.extend({ users: sanitizedQuery.username }, filters);
    }
    const roles = yield Role.find(mongoQuery).lean().select('permissions');
    const permissions = combinePermissions(roles.map(x => x.permissions));
    return permissions;
  }

  const updateUserRolesSchema = Joi.object({
    username: Joi.string().required(),
    service: Joi.string(),
    company: Joi.string(),
    roles: Joi.array().items(
      Joi.object({ id: Joi.string().required() })
        .options({ stripUnknown: true })
    ),
  });

  // HACK: Dumb implementation for now, no ideas and time to make it better
  function* updateUserRoles(command) {
    const user = yield User.findById(command.username).select('_id');
    if (!user) {
      throw new NotFoundError('User');
    }
    const sanitizedCommand = validator.sanitize(command, updateUserRolesSchema);
    // Remove user from all the roles he is assigned to
    let query = {
      users: sanitizedCommand.username,
      service: sanitizedCommand.service,
      company: sanitizedCommand.company,
    };
    query = _.pickBy(query, _.negate(_.isUndefined));
    let update = { $pull: { users: sanitizedCommand.username } };
    yield Role.update(query, update, { multi: true });
    // Assign user to all requested roles
    query = _.omit({
      ...query,
      _id: { $in: sanitizedCommand.roles.map(x => x.id) },
    }, 'users');
    update = { $addToSet: { users: sanitizedCommand.username } };
    yield Role.update(query, update, { multi: true });
    return yield getRoles({
      service: sanitizedCommand.service,
      company: sanitizedCommand.company,
      username: sanitizedCommand.username,
    });
  }

  return {
    createRole,
    getRoles,
    deleteRole,
    updateRole,
    updateUserRoles,
    getUserPermissions,
  };
}
