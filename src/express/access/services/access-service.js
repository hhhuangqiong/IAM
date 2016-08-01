import _ from 'lodash';
import Joi from 'joi';
import { NotFoundError, ValidationError } from 'common-errors';

import { combinePermissions } from './combine-permissions';
import { rename } from './../../../utils';

const PERMISSION = {
  CREATE: 'create',
  UPDATE: 'update',
  READ: 'read',
  DELETE: 'delete',
};

const PERMISSIONS = _.values(PERMISSION);

export function accessService(validator, { Role, Company, User }) {
  const permissionsEnumSchema = Joi.string().valid(PERMISSIONS);
  const permissionsSchema = Joi.object().pattern(/.+/, Joi.array().items(permissionsEnumSchema));

  const createRoleCommandSchema = Joi.object({
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
    const company = yield Company.findOne({ _id: companyId }).select('_id');
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
    const filters = _.pickBy(sanitizedQuery, x => _.isString(x) && x.length > 0);
    const roles = yield Role.find(filters).lean().select('-permissions -users');
    return roles.map(x => rename(x, { _id: 'id' }));
  }

  const deleteRoleCommandSchema = Joi.object({
    roleId: Joi.string().required(),
  });

  function* deleteRole(command) {
    const sanitizedCommand = validator.sanitize(command, deleteRoleCommandSchema);
    yield Role.remove({ _id: sanitizedCommand.roleId });
  }

  const getRolePermissionsQuerySchema = Joi.object({
    roleId: Joi.string().required(),
  });

  function* getRolePermissions(query) {
    const sanitizedQuery = validator.sanitize(query, getRolePermissionsQuerySchema);
    const role = yield Role.findOne({ _id: sanitizedQuery.roleId }).select('permissions');
    if (!role) {
      throw new NotFoundError('Role');
    }
    return role.toJSON().permissions;
  }

  const setRolePermissionsCommandSchema = Joi.object({
    roleId: Joi.string(),
    permissions: permissionsSchema,
  });

  function* setRolePermissions(command) {
    const sanitizedCommand = validator.sanitize(command, setRolePermissionsCommandSchema);
    const role = yield Role.findOne({ _id: command.roleId });
    if (!role) {
      throw new NotFoundError('Role');
    }
    role.permissions = command.permissions;
    yield role.save();
    return sanitizedCommand.permissions;
  }

  const getUserPermissionsQuerySchema = Joi.object({
    username: Joi.string().required(),
    service: Joi.string().allow(['', null]).optional(),
    company: Joi.string().allow(['', null]).optional(),
  });

  function* getUserPermissions(query) {
    const sanitizedQuery = validator.sanitize(query, getUserPermissionsQuerySchema);
    const filters = _(sanitizedQuery)
      .omit('username')
      .pickBy(x => _.isString(x) && x.length > 0)
      .value();
    const mongoQuery = _.extend({ users: sanitizedQuery.username }, filters);
    const roles = yield Role.find(mongoQuery).lean().select('permissions');
    const permissions = combinePermissions(roles.map(x => x.permissions));
    return permissions;
  }

  const assignRoleCommandSchema = Joi.object({
    username: Joi.string().required(),
    roleId: Joi.string().required(),
  });

  function* assignRole(command) {
    const sanitizedCommand = validator.sanitize(command, assignRoleCommandSchema);
    const user = yield User.findById(sanitizedCommand.username).select('_id');
    if (!user) {
      throw new NotFoundError('User');
    }
    const query = { _id: sanitizedCommand.roleId };
    const update = { $addToSet: { users: user._id } };
    const role = yield Role.findOneAndUpdate(query, update).select('_id');
    if (!role) {
      throw new NotFoundError('Role');
    }
    return sanitizedCommand;
  }

  const revokeRoleCommandSchema = Joi.object({
    username: Joi.string().required(),
    roleId: Joi.string().required(),
  });

  function* revokeRole(command) {
    const sanitizedCommand = validator.sanitize(command, revokeRoleCommandSchema);
    const query = { _id: sanitizedCommand.roleId };
    const update = { $pull: { users: sanitizedCommand.username } };
    const role = yield Role.findOneAndUpdate(query, update);
    if (!role) {
      throw new NotFoundError('Role');
    }
  }

  return {
    createRole,
    getRoles,
    deleteRole,
    getRolePermissions,
    setRolePermissions,
    assignRole,
    revokeRole,
    getUserPermissions,
  };
}
