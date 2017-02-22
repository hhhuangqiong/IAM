import { CALL_API } from '../middleware/api';
import {
  SET_PASSWORD_REQUEST,
  SET_PASSWORD_SUCCESS,
  SET_PASSWORD_FAILURE,
} from '../constants/actionType';

function callSetPassword(payload) {
  return {
    [CALL_API]: {
      types: [SET_PASSWORD_REQUEST, SET_PASSWORD_SUCCESS, SET_PASSWORD_FAILURE],
      endpoint: 'openid/setPassword',
      options: {
        method: 'POST',
        body: payload,
      },
    },
  };
}

export default function setPassword(payload) {
  return dispatch => dispatch(callSetPassword(payload));
}
