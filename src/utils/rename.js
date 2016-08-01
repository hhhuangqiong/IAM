import * as _ from 'lodash';

export function rename(obj, definition) {
  if (!_.isObject(obj)) {
    return obj;
  }
  return _.mapKeys(obj, (value, key) => {
    const destKey = definition[key];
    if (_.isString(destKey)) {
      return destKey;
    }
    return key;
  });
}

export default rename;
