import express from 'express';
import bodyParser from 'body-parser';

import { router as accessRouter } from './access';
import { router as identityRouter } from './identity';

const ACCESS_PREFIX = '/access';
const IDENTITY_PREFIX = '/identity';

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true,
}));

// set up the route for access and identity
app.use(ACCESS_PREFIX, accessRouter);
app.use(IDENTITY_PREFIX, identityRouter);

export default app;
