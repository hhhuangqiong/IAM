import mongoose, { Schema } from 'mongoose';
import timestamp from 'mongoose-timestamp';
import { check } from 'm800-util';

const { Types } = Schema;

const schema = new Schema({
  name: { type: String, required: true },
  company: { type: Types.ObjectId, ref: 'Company', required: true },
  service: { type: String, required: true },
  users: [{ type: Types.String, ref: 'User' }],
}, {
  collection: 'Group',
  discriminatorKey: 'kind',
});

schema.index({ name: 1, company: 1, service: 1 }, { unique: true });
schema.plugin(timestamp);

export function createGroupModel(mongooseConnection = mongoose) {
  check.ok('mongooseConnection', mongooseConnection);
  return mongooseConnection.model('Group', schema);
}

export default createGroupModel;
