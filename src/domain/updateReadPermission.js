import _ from 'lodash';

// ensure all the actions with create, update, delete have read permission.
export function updateReadPermission(permissions) {
  const mPermission = _.cloneDeep(permissions);
  _.forEach(mPermission, (actions) => {
    // create update delete should have read
    if (_.intersection(actions, ['create', 'update', 'delete']).length > 0
     && !_.includes(actions, 'read')) {
      actions.push('read');
    }

    // create, delete should have update
    if (_.intersection(actions, ['create', 'delete']).length > 0
     && !_.includes(actions, 'update')) {
      actions.push('update');
    }
  });
  return mPermission;
}

export default updateReadPermission;
