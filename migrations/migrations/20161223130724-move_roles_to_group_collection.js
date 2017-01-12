import { defineMigration } from 'm800-util';

module.exports = defineMigration(async (db) => {
  const collections = await db.listCollections({ name: 'Role' }).toArray();
  if (collections.length === 0) {
    return;
  }
  await db.renameCollection('Role', 'Group');
  const update = {
    $set: {
      kind: 'Role',
    },
  };
  await db.collection('Group').update({}, update, { multi: true });
});
