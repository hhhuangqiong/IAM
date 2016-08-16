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
    .then(app => {
      const server = request.agent(app);
      const state = new StateManager(mongoose);
      return {
        server,
        db: mongoose,
        state,
      };
    })
);

export default initialize;
