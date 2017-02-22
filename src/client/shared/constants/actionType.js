import _ from 'lodash';

const actionTypes = [
  'REQUEST_RESET_PASSWORD_REQUEST',
  'REQUEST_RESET_PASSWORD_SUCCESS',
  'REQUEST_RESET_PASSWORD_FAILURE',
  'SET_PASSWORD_REQUEST',
  'SET_PASSWORD_SUCCESS',
  'SET_PASSWORD_FAILURE',
];

// convert the array to a map with key==value
const actionType = _.zipObject(actionTypes, actionTypes);
export default actionType;
