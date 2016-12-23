import _ from 'lodash';
import Joi from 'joi';
import { NotFoundError, ValidationError, InvalidOperationError } from 'common-errors';

import { combinePermissions } from './combine-permissions';
import { rename } from './../../../utils';

// In general on IAM, there are 3 general permissions, which are company, user and role
// only reseller company can have company permission
// throw exception when assign company resource on non reseller company
function validateCompanyPermission(company, permissions) {
  if (!permissions || !permissions.company || !permissions.company.length) {
    return;
  }
  if (!company.reseller) {
    throw new InvalidOperationError('only reseller company can have permission on company resources');
  }
}

// ensure all the actions with create, update, delete have read permission.
function updateReadPermission(permissions) {
  const mPermission = _.cloneDeep(permissions);
  _.forEach(mPermission, (actions) => {
    // create update delete should have read
    if (_.intersection(actions, ['create', 'update', 'delete']).length > 0
     && !_.includes(actions, 'read')) {
      actions.push('read');
    }

    // create, delete should have update
    if (_.intersection(actions, ['create', 'delete']).length > 0
     && !_.includes(actions, 'update')) {
      actions.push('update');
    }
  });
  return mPermission;
}

const objectIdRegExp = /^[0-9a-fA-F]{24}$/;

export function accessService(validator, { Role, Company, User }) {
  // root role is the first role created on the company and service.
  // check if there is any root role (first role) related to the company and service
  function* hasRootRole(command) {
    const roles = yield Role.find(_.pick(command, 'company', 'service'));
    return !!roles.length;
  }

  // Not allow to change the root role.
  // check if the role is root role, throw exception
  function* validateRootRole(roleId) {
    const role = yield Role.findById(roleId);
    if (role && role.isRoot) {
      throw new InvalidOperationError('It is not allowed to edit or delete admin role');
    }
  }

  const formatRole = _.flow([
    // eslint-disable-next-line no-confusing-arrow
    o => _.isFunction(o.toJSON) ? o.toJSON() : o,
    o => rename(o, { _id: 'id' }),
    o => _.omit(o, ['__v', 'kind', 'users']),
  ]);

  // permission values must be array with single value that with four possible values
  const permissionsSchema = Joi.object().pattern(/.+/,
    Joi.array().items(Joi.string().valid('read', 'update', 'create', 'delete')).unique());

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
    const company = yield Company.findById(companyId).select('_id reseller');
    if (!company) {
      throw new NotFoundError('Company');
    }
    validateCompanyPermission(company, sanitizedCommand.permissions);
    // to ensure and update the permission that only has write, delete, update to be with read permission
    sanitizedCommand.permissions = updateReadPermission(sanitizedCommand.permissions);
    const rootRole = yield hasRootRole(sanitizedCommand);
    // set the first role of company, service as isRoot to be true
    if (!rootRole) {
      sanitizedCommand.isRoot = true;
    }
    try {
      const role = yield Role.create(sanitizedCommand);
      return formatRole(role);
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
    return roles.map(formatRole);
  }

  const deleteRoleCommandSchema = Joi.object({
    roleId: Joi.string().regex(objectIdRegExp).required(),
  });

  function* deleteRole(command) {
    const sanitizedCommand = validator.sanitize(command, deleteRoleCommandSchema);
    yield validateRootRole(sanitizedCommand.roleId);
    yield Role.remove({ _id: sanitizedCommand.roleId });
  }

  const updateRoleCommandSchema = createRoleCommandSchema
    .keys({ id: Joi.string().regex(objectIdRegExp).required() })
    .rename('roleId', 'id', { override: true });

  function* updateRole(command) {
    const sanitizedCommand = validator.sanitize(command, updateRoleCommandSchema);
    const company = yield Company.findById(sanitizedCommand.company);
    if (!company) {
      throw new NotFoundError('Company');
    }
    validateCompanyPermission(company, sanitizedCommand.permissions);
    sanitizedCommand.permissions = updateReadPermission(sanitizedCommand.permissions);
    yield validateRootRole(sanitizedCommand.id);

    const role = yield Role.findOneAndUpdate(
      { _id: sanitizedCommand.id },
      { $set: _.omit(sanitizedCommand, 'id') },
      { new: true }
    ).select('-users');
    if (!role) {
      throw new NotFoundError('Role');
    }
    return formatRole(role);
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
