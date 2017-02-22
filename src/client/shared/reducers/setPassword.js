import {
  SET_PASSWORD_REQUEST,
  SET_PASSWORD_SUCCESS,
  SET_PASSWORD_FAILURE,
} from '../constants/actionType';

function getStatus(status, action) {
  switch (action.type) {
    case SET_PASSWORD_REQUEST:
    case SET_PASSWORD_SUCCESS:
    case SET_PASSWORD_FAILURE:
      return action.status;
    default:
      return status;
  }
}

export default function setPassword(state = {}, action) {
  return {
    requestStatus: getStatus(state.requestStatus, action),
    requestError: action.type === SET_PASSWORD_FAILURE ? action.error : null,
  };
}
