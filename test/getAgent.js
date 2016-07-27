import Q from 'q';
import mockgoose from 'mockgoose';
import mongoose from 'mongoose';
import request from 'supertest';

import { createServer } from '../src/server';

let agent;

export default function getAgent() {
  if (agent) {
    return Q.resolve(agent);
  }
  return mockgoose(mongoose).then(() =>
    createServer().then(app => {
      agent = request.agent(app);
      return agent;
    }));
}
