import Bottle from 'bottlejs';
import Grid from 'gridfs-stream';
import mongoose from 'mongoose';
import Q from 'q';

import nconf from '../initializers/nconf';
import gridFs from './gridFs';

import { companyService } from '../express/identity/services/company-service';
import { logoService } from '../express/identity/services/logo-service';
import { userService } from '../express/identity/services/user-service';
import { accessService } from '../express/access/services/access-service';
import { roleController } from '../express/access/controllers/role-controller';
import { userController as roleUserController } from '../express/access/controllers/user-controller';
import { userController } from '../express/identity/controllers/user-controller';
import { companyController } from '../express/identity/controllers/company-controller';
import { collections } from '../collections';
import { validator } from './validator';

let iocBottle;

export function initialize() {
  if (iocBottle) {
    return iocBottle;
  }

  iocBottle = new Bottle();

  iocBottle.factory('mongoose', () => {
    // set up the mongoose Promise to use q.
    mongoose.Promise = Q.Promise;
    return mongoose;
  });

  // gridfs to store file in mongo
  iocBottle.factory('gridFs', (container) => {
    const db = container.mongoose.connection.db;
    const mongoDriver = container.mongoose.mongo;
    return new Grid(db, mongoDriver);
  });

  // config
  iocBottle.service('config', nconf);

  // storage
  iocBottle.factory('storage', () => gridFs);

  // all the collection models
  iocBottle.factory('models', () => collections);

  // validate the command schema
  iocBottle.service('validator', validator);

  // company logo service
  iocBottle.service('logoService', logoService, 'validator', 'models', 'storage');

  // company service
  iocBottle.service('companyService', companyService, 'validator', 'models', 'logoService');

  // user service
  iocBottle.service('userService', userService, 'validator', 'models');

  // access service
  iocBottle.service('accessService', accessService, 'validator', 'models');

  // access role controller
  iocBottle.service('accessRoleController', roleController, 'accessService');

  // acces role user controller
  iocBottle.service('accessUserController', roleUserController, 'accessService');

  // identity company controller
  iocBottle.service('identityCompanyController', companyController, 'companyService', 'logoService');

  // identity user controller
  iocBottle.service('identityUserController', userController, 'userService');

  return iocBottle;
}

export function get() {
  return iocBottle;
}


export function getContainer() {
  return iocBottle && iocBottle.container;
}

export const ioc = {
  initialize,
  get,
  getContainer,
};

export default ioc;