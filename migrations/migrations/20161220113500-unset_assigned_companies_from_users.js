import { defineMigration } from 'm800-util';

module.exports = defineMigration(async(db) => {
  const update = {
    $unset: { assignedCompanies: '' },
  };
  // To unset assignedCompanies from all users
  // since assigned companies will be handled in the roles
  await db.collection('User').update({}, update, { multi: true });
});
