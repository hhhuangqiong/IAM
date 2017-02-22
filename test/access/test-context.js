import _ from 'lodash';
import { StateManager } from './state-manager';
import getTestContext from './../testContext';

export const initialize = _.memoize(async () => {
  const { agent, mongooseConnection, models } = await getTestContext();
  return {
    server: agent,
    db: mongooseConnection.db,
    state: new StateManager(mongooseConnection),
    models,
  };
});

export default initialize;
