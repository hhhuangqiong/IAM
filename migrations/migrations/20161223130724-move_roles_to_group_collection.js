import { defineMigration } from 'm800-util';

module.exports = defineMigration(async (db) => {
  await db.collection('Role').rename('Group');
  const update = {
    $set: {
      kind: 'Role',
    },
  };
  await db.collection('Group').update({}, update, { multi: true });
});
