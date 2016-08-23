import { combineReducers } from 'redux';
import requestResetPassword from './requestResetPassword';
import setPassword from './setPassword';

const rootReducer = combineReducers({
  requestResetPassword,
  setPassword,
});

export default rootReducer;
