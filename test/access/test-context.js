import * as _ from 'lodash';
import Q from 'q';
import mockgoose from 'mockgoose';
import mongoose from 'mongoose';
import request from 'supertest-as-promised';

import { createServer } from './../../src/server';
import { StateManager } from './state-manager';

const env = process.env.NODE_ENV || 'development';

export const initialize = _.memoize(() =>
  Q.resolve(env === 'test-local' ? mongoose : mockgoose(mongoose))
    .then(() => createServer(env))
    .then(app =>
      /* eslint new-cap: ["error", { "capIsNewExceptions": ["Q.Promise"] }]*/
      // wait for the mongoose to be connected before test, which insert, update data
      Q.Promise((resolve) => {
        mongoose.connection.on('connected', () => {
          resolve({
            server: request.agent(app),
            db: mongoose,
            state: new StateManager(mongoose),
          });
        });
      })
    )
);

export default initialize;
