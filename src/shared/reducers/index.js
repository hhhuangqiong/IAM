import { combineReducers } from 'redux';
import requestResetPassword from './requestResetPassword';

const rootReducer = combineReducers({
  requestResetPassword,
});

export default rootReducer;
