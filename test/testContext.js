import _ from 'lodash';
import mockgoose from 'mockgoose';
import mongoose from 'mongoose';
import request from 'supertest';
import config from './../src/config';
import { create } from './../src/app';


const getTestContext = _.memoize(async () => {
  if (_.get(config, 'tests.useMockgoose')) {
    await mockgoose(mongoose);
  }
  const app = create(config);
  const { server, openIdProvider } = app;
  await openIdProvider.registerClient();
  const expressServer = server.start();
  return {
    agent: request.agent(expressServer),
    models: app.models,
    mongooseConnection: app.mongooseConnection,
    gridFs: app.gridFs,
    app,
  };
});

export default getTestContext;
