import * as _ from 'lodash';
import Q from 'q';
import mongoose from 'mongoose';

import { StateManager } from './state-manager';
import getAgent from './../getAgent';

export const initialize = _.memoize(() =>
    getAgent()
    .then(agent =>
      /* eslint new-cap: ["error", { "capIsNewExceptions": ["Q.Promise"] }]*/
      // wait for the mongoose to be connected before test, which insert, update data
      Q.Promise((resolve, reject) => {
        mongoose.connection.on('connected', () => {
          resolve({
            server: agent,
            db: mongoose,
            state: new StateManager(mongoose),
          });
        });
        mongoose.connection.on('error', reject);
      })
    )
);

export default initialize;
