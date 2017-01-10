import { defineMigration } from 'm800-util';

module.exports = defineMigration(async(db) => {
  const filter = { isRoot: true };
  const update = {
    $set: {
      'permissions.callCostExport': ['read'],
      'permissions.smsCostExport': ['read'],
    },
  };
  // To add the costExport permission when isRoot is true
  await db.collection('Group').update(filter, update, { multi: true });
});
