import _ from 'lodash';

const actionTypes = [
  'REQUEST_RESET_PASSWORD_REQUEST',
  'REQUEST_RESET_PASSWORD_SUCCESS',
  'REQUEST_RESET_PASSWORD_FAILURE',
];

// convert the array to a map with key==value
export default actionTypes.reduce((obj, type) => _.assign({}, obj, { [type]: type }), {});
