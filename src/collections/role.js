import { Schema } from 'mongoose';

import Group from './group';

const { Types } = Schema;

const schema = new Schema({
  permissions: { type: Types.Mixed, default: {} },
  isRoot: { type: Boolean, default: false },
});

export const Role = Group.discriminator('Role', schema);

export default Role;
