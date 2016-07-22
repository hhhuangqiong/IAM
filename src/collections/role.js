import mongoose from 'mongoose';
import timestamp from 'mongoose-timestamp';

const Types = mongoose.Schema.Types;

const schema = new mongoose.Schema({
  name: { type: String, required: true },
  company: { type: Types.ObjectId, ref: 'Company', required: true },
  service: { type: String, required: true },
  permissions: { type: Types.Mixed },
  users: [{ type: Types.ObjectId, ref: 'User' }],
}, {
  collection: 'Role',
  versionKey: false,
});

schema.index({ name: 1, company: 1, service: 1 }, { unique: true });
schema.plugin(timestamp);

export const Role = mongoose.model('Role', schema);
export default Role;
