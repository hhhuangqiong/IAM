import { Router } from 'express';
import logger from 'winston';

import { validator } from './services/validator';
import { accessService } from './services/access-service';
import { roleController } from './controllers/role-controller';
import { userController } from './controllers/user-controller';
import { errorHandler } from './controllers/error-handler';
import { collections } from './../../collections';

export const router = new Router();

const accessServiceInstance = accessService({
  validator: validator(),
  models: collections,
});

roleController({
  router,
  accessService: accessServiceInstance,
});

userController({
  router,
  accessService: accessServiceInstance,
});

errorHandler({
  router,
  logger,
}, {
  env: process.NODE_ENV,
});
