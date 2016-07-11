import Q from 'q';
import mongoose from 'mongoose';
import mockgoose from 'mockgoose';
import request from 'supertest';
import { createServer } from '../src/server';

let agent;

export default function getAgent() {
  if (agent) {
    return Q.resolve(agent);
  }
  return mockgoose(mongoose).then(() => {
    agent = request.agent(createServer('development'));
    return agent;
  });
}
