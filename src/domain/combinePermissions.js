import _ from 'lodash';

export function combinePermissions(permissions) {
  if (permissions.length === 1) {
    return permissions[0];
  }
  const unionPermissionArrays = (src, dest) => {
    if (_.isArray(src)) {
      return _.union(src, dest);
    }
    return undefined;
  };
  return _.mergeWith({}, ...permissions, unionPermissionArrays);
}

export default combinePermissions;
