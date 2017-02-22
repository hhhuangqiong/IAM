import Joi from 'joi';
import joiObjectId from 'joi-objectid';
import _ from 'lodash';
import fp from 'lodash/fp';
import Promise from 'bluebird';
import { NotFoundError } from 'common-errors';
import { check } from 'm800-util';

import {
  DEFAULT_PAGE_SIZE,
  DEFAULT_PAGE_NO,
  DEFAULT_SORT_ORDER,
} from './constants';
import { rename, validator } from './util';

Joi.objectId = joiObjectId(Joi);

const formatEntity = _.flow([
  g => _.invoke(g, 'toJSON') || g,
  g => rename(g, { _id: 'id' }),
  fp.omit(['__v', '__t']),
]);

export function groupService(models) {
  check.members('models', models, ['Group', 'Company', 'User']);

  const { Group, Company, User } = models;
  const GROUP_DISCRIMINATOR_KEY = Group.schema.options.discriminatorKey;

  const formatGroup = _.flow([
    formatEntity,
    fp.omit(GROUP_DISCRIMINATOR_KEY),
  ]);

  const pagedQuerySchema = Joi.object().keys({
    page: Joi.number().positive().default(DEFAULT_PAGE_NO),
    pageSize: Joi.number().positive().default(DEFAULT_PAGE_SIZE),
    sortBy: Joi.string().default('name'),
    sortOrder: Joi.string().valid('asc', 'desc').default(DEFAULT_SORT_ORDER),
  });

  const parseGroupFilter = _.cond([
    [
      _.conforms({
        name: fp.eq('name'),
        value: _.negate(_.isEmpty),
      }),
      ({ value, name }) => [name, { $regex: new RegExp(`^${value}`, 'i') }],
    ],
    [
      _.conforms({ value: _.negate(_.isEmpty) }),
      ({ value, name }) => [name, value],
    ],
    [
      () => true,
      () => null,
    ],
  ]);

  const listGroupsSchema = pagedQuerySchema.keys({
    name: Joi.string(),
    service: Joi.string(),
    company: Joi.objectId(),
  });

  async function listGroups(query) {
    const sanitizedQuery = validator.sanitize(query, listGroupsSchema);
    const filters = _(sanitizedQuery)
      .pick(['name', 'service', 'company'])
      .map((value, name) => parseGroupFilter({ value, name }))
      .filter(_.negate(_.isNull))
      .fromPairs()
      .value();
    filters[GROUP_DISCRIMINATOR_KEY] = { $exists: false };
    const [items, total] = await Promise.all([
      Group.find(filters)
        .sort({ [sanitizedQuery.sortBy]: sanitizedQuery.sortOrder })
        .skip((sanitizedQuery.page - 1) * sanitizedQuery.pageSize)
        .limit(sanitizedQuery.pageSize),
      Group.count(filters),
    ]);
    return {
      total,
      pageTotal: Math.ceil(total / sanitizedQuery.pageSize),
      page: sanitizedQuery.page,
      pageSize: sanitizedQuery.pageSize,
      items: items.map(formatGroup),
    };
  }

  const listGroupUsersSchema = Joi.object({
    groupId: Joi.objectId().required(),
  });

  async function listGroupUsers(query) {
    const sanitizedQuery = validator.sanitize(query, listGroupUsersSchema);
    const group = await Group
      .findOne({
        _id: sanitizedQuery.groupId,
        [GROUP_DISCRIMINATOR_KEY]: { $exists: false },
      })
      .select({ users: 1 })
      .populate('users');
    if (!group) {
      throw new NotFoundError(`Group ${query.groupId}`);
    }
    return group.users.map(formatGroup);
  }

  const getGroupSchema = Joi.object({
    groupId: Joi.objectId().required(),
    expandUsers: Joi.boolean().default(false),
  }).rename('users', 'expandUsers');

  async function getGroup(query) {
    const sanitizedQuery = validator.sanitize(query, getGroupSchema);
    let mquery = Group.findOne({
      _id: sanitizedQuery.groupId,
    });
    if (sanitizedQuery.expandUsers) {
      mquery = mquery.populate('users');
    }
    const group = await mquery;
    if (!group) {
      throw new NotFoundError(`Group ${sanitizedQuery.groupId}`);
    }
    return formatGroup(group);
  }

  async function ensureReferencesExist(group) {
    const company = await Company.findOne({ _id: group.company }).select('_id');
    if (!company) {
      throw new NotFoundError(`Company ${group.company}`);
    }
    const users = await User.find({
      _id: { $in: group.users },
      affiliatedCompany: company._id,
    })
    .select({ _id: 1, affiliatedCompany: 1 });
    const existingUserIds = users.map(x => x._id);
    const diff = _.difference(group.users, existingUserIds);
    if (diff.length > 0) {
      throw new NotFoundError(`Users ${diff.join(',')}`);
    }
  }

  const groupSchema = Joi.object().keys({
    name: Joi.string().min(1),
    company: Joi.objectId(),
    service: Joi.string(),
    users: Joi.array()
      .default([])
      .optional()
      .items(Joi.string().email()),
  }).options({ presence: 'required' });

  const createGroupSchema = groupSchema;

  async function createGroup(command) {
    const sanitizedCommand = validator.sanitize(command, createGroupSchema);
    await ensureReferencesExist(sanitizedCommand);
    const group = await Group.create(sanitizedCommand);
    return formatGroup(group);
  }

  const updateGroupSchema = groupSchema.keys({
    groupId: Joi.objectId(),
  });

  async function updateGroup(command) {
    const sanitizedCommand = validator.sanitize(command, updateGroupSchema);
    await ensureReferencesExist(sanitizedCommand);
    const group = await Group.findOneAndUpdate(
      { _id: sanitizedCommand.groupId, [GROUP_DISCRIMINATOR_KEY]: { $exists: false } },
      _.omit(sanitizedCommand, ['groupId']),
      { new: true },
    );
    return formatGroup(group);
  }

  const removeGroupSchema = Joi.object({
    groupId: Joi.objectId().required(),
  });

  async function removeGroup(command) {
    const sanitizedQuery = validator.sanitize(command, removeGroupSchema);
    await Group.remove({
      _id: sanitizedQuery.groupId,
      [GROUP_DISCRIMINATOR_KEY]: { $exists: false },
    });
  }

  return {
    listGroups,
    listGroupUsers,
    createGroup,
    getGroup,
    updateGroup,
    removeGroup,
  };
}

export default groupService;
