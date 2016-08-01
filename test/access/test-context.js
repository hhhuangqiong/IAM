import * as _ from 'lodash';
import Q from 'q';
import mockgoose from 'mockgoose';
import mongoose from 'mongoose';
import request from 'supertest';

import { createServer } from './../../src/server';
import { StateManager } from './state-manager';

const env = process.env.NODE_ENV || 'development';

export const initialize = _.memoize(() => {
  return Q.resolve(env === 'test-local' ? mongoose : mockgoose(mongoose))
    .then(() => {
      const server = request.agent(createServer(env));
      const state = new StateManager(mongoose);
      return {
        server,
        db: mongoose,
        state,
      };
    });
});

export default initialize;
