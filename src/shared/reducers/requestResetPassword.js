import {
  REQUEST_RESET_PASSWORD_REQUEST,
  REQUEST_RESET_PASSWORD_SUCCESS,
  REQUEST_RESET_PASSWORD_FAILURE,
} from '../../constants/actionType';

function getStatus(status, action) {
  switch (action.type) {
    case REQUEST_RESET_PASSWORD_REQUEST:
    case REQUEST_RESET_PASSWORD_SUCCESS:
    case REQUEST_RESET_PASSWORD_FAILURE:
      return action.status;
    default:
      return status;
  }
}

export default function requestResetPassword(state = {}, action) {
  return {
    requestStatus: getStatus(state.requestStatus, action),
    requestError: action.type === REQUEST_RESET_PASSWORD_FAILURE ? action.error : null,
  };
}
