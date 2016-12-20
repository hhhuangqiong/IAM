import { defineMigration } from 'm800-util';

module.exports = defineMigration(async(db) => {
  const filter = { isRoot: true };
  const update = {
    $set: {
      'permissions.smsExport': ['read'],
    },
  };
  // To add the sms export permission when isRoot is true
  await db.collection('Role').update(filter, update, { multi: true });
});
