import { Schema } from 'mongoose';
import { check } from 'm800-util';

const { Types } = Schema;

const schema = new Schema({
  permissions: { type: Types.Mixed, default: {} },
  isRoot: { type: Boolean, default: false },
});

export function createRoleModel(Group) {
  check.ok('Group', Group);
  return Group.discriminator('Role', schema);
}

export default createRoleModel;
