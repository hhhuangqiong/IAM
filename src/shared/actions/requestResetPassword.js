import { CALL_API } from '../middleware/api';
import {
  REQUEST_RESET_PASSWORD_REQUEST,
  REQUEST_RESET_PASSWORD_SUCCESS,
  REQUEST_RESET_PASSWORD_FAILURE,
} from '../../constants/actionType';

// Fetches 'openid/requestResetPassword' API
// Relies on the custom API middleware defined in ../middleware/api.js.
function callRequestResetPassword(payload) {
  return {
    [CALL_API]: {
      types: [REQUEST_RESET_PASSWORD_REQUEST, REQUEST_RESET_PASSWORD_SUCCESS, REQUEST_RESET_PASSWORD_FAILURE],
      endpoint: 'openid/resetPassword',
      options: {
        method: 'POST',
        body: payload,
      },
    },
  };
}

// requestResetPassword action thunk
// Relies on Redux Thunk middleware.
export default function requestResetPassword(payload) {
  return (dispatch) => dispatch(callRequestResetPassword(payload));
}
