import 'isomorphic-fetch';
import { REQUSET, SUCCESS, FAILURE } from '../../constants/actionStatus';

// Action key that carries API call info interpreted by this Redux middleware.
export const CALL_API = 'CALL_API';

const API_ROOT = '/';

function callApi(endpoint, init) {
  const url = API_ROOT + endpoint;

  return fetch(url, init)
    .then(response =>
      response.json().then(json => ({ json, response }))
    ).then(({ json, response }) => {
      if (!response.ok) {
        return Promise.reject(json);
      }
      return json;
    });
}

// A Redux middleware that interprets actions with CALL_API info specified.
// Performs the call and promises when such actions are dispatched.
export default store => next => action => {
  const callAPI = action[CALL_API];
  if (typeof callAPI === 'undefined') {
    return next(action);
  }

  let { endpoint } = callAPI;
  const { types, init } = callAPI;

  if (typeof endpoint === 'function') {
    endpoint = endpoint(store.getState());
  }

  if (typeof endpoint !== 'string') {
    throw new Error('Specify a string endpoint URL.');
  }
  if (!Array.isArray(types) || types.length !== 3) {
    throw new Error('Expected an array of three action types.');
  }
  if (!types.every(type => typeof type === 'string')) {
    throw new Error('Expected action types to be strings.');
  }

  function actionWith(data) {
    const finalAction = Object.assign({}, action, data);
    delete finalAction[CALL_API];
    return finalAction;
  }

  const [requestType, successType, failureType] = types;
  next(actionWith({
    type: requestType,
    status: REQUSET,
  }));

  return callApi(endpoint, init).then(
    response => next(actionWith({
      response,
      type: successType,
      status: SUCCESS,
    })),
    error => next(actionWith({
      type: failureType,
      status: FAILURE,
      error: error.message || 'Call API failed',
    }))
  );
};
