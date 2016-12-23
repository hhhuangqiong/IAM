import Bottle from 'bottlejs';
import Grid from 'gridfs-stream';
import mongoose from 'mongoose';
import Q from 'q';
import M800MailClient from 'm800-mail-service-client';

import nconf from '../initializers/nconf';
import gridFs from './gridFs';

import { companyService } from '../express/identity/services/company-service';
import { logoService } from '../express/identity/services/logo-service';
import { userService } from '../express/identity/services/user-service';
import { groupService } from '../express/identity/services/group-service';
import { emailService } from '../express/identity/services/email-service';
import { accessService } from '../express/access/services/access-service';
import { roleController } from '../express/access/controllers/role-controller';
import { userController as roleUserController } from '../express/access/controllers/user-controller';
import { userController } from '../express/identity/controllers/user-controller';
import { groupController } from '../express/identity/controllers/group-controller';
import { companyController } from '../express/identity/controllers/company-controller';
import { openIdController } from '../express/openid/openid-controller';
import { decodeParamsMiddleware } from '../express/middleware/decodeParams';
import { setUp } from '../koa/openid/provider';
import { config as openIdConfig, certificates as openIdCert } from '../koa/openid/settings';
import { collections } from '../collections';
import { validator } from './validator';

let bottle;

export function initialize() {
  if (bottle) {
    return bottle;
  }

  bottle = new Bottle();

  bottle.factory('mongoose', () => {
    // set up the mongoose Promise to use q.
    mongoose.Promise = Q.Promise;
    return mongoose;
  });

  bottle.factory('gridFs', (container) => {
    const db = container.mongoose.connection.db;
    const mongoDriver = container.mongoose.mongo;
    return new Grid(db, mongoDriver);
  });

  bottle.constant('decodeParamsMiddleware', decodeParamsMiddleware);

  bottle.service('config', nconf);
  bottle.factory('storage', () => gridFs);

  bottle.factory('models', () => collections);
  bottle.service('validator', validator);

  bottle.service('logoService', logoService, 'validator', 'models', 'storage');
  bottle.service('companyService', companyService, 'validator', 'models', 'logoService');
  bottle.factory('emailClient', ({ config }) =>
    new M800MailClient({ baseUrl: config.get('MAIL_SERVICE_URL') })
  );

  bottle.service('emailService', emailService, 'emailClient', 'config');
  bottle.service('userService', userService, 'validator', 'models', 'emailService');
  bottle.service('groupService', groupService, 'validator', 'models');
  bottle.service('accessService', accessService, 'validator', 'models');

  bottle.service('accessRoleController', roleController, 'accessService');
  bottle.service('accessUserController', roleUserController, 'accessService');
  bottle.service('identityCompanyController', companyController, 'companyService', 'logoService');
  bottle.service('identityGroupController', groupController, 'groupService');
  bottle.service('identityUserController', userController, 'userService');

  bottle.constant('openIdSetting', openIdConfig);
  bottle.constant('openIdCertificates', openIdCert);
  bottle.factory('openIdProvider', ({ config, openIdSetting, openIdCertificates }) =>
    setUp(config, openIdSetting, openIdCertificates)
  );
  bottle.service('openIdController', openIdController, 'openIdProvider', 'userService');

  return bottle;
}

export function get() {
  return bottle;
}

export function getContainer() {
  return bottle && bottle.container;
}

export const ioc = {
  initialize,
  get,
  getContainer,
};

export default ioc;
