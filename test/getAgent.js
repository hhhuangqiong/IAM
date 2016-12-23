import Q from 'q';
import mockgoose from 'mockgoose';
import mongoose from 'mongoose';
import request from 'supertest';
import _ from 'lodash';

import { createServer } from '../src/server';
import createConfig from './../src/initializers/nconf';

const getAgent = _.memoize(() => {
  const config = createConfig();
  const init = config.get('tests:useMockgoose') ? mockgoose(mongoose) : Q.resolve();
  return init
    .then(createServer)
    .then(app => request.agent(app));
});

export default getAgent;
