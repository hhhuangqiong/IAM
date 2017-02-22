import M800MailClient from 'm800-mail-service-client';
import { mongo } from 'mongoose';
import Grid from 'gridfs-stream';
import { promisifyAll } from 'bluebird';

import accessService from './accessService';
import companyService from './companyService';
import emailService from './emailService';
import groupService from './groupService';
import logoService from './logoService';
import userService from './userService';
import { createGridFsStorage } from './storage';
import {
  createCompanyModel,
  createGroupModel,
  createRoleModel,
  createUserModel,
} from './models';
import {
  createOpenIdMongoAdapter,
  createOpenIdProvider,
  createAccount,
  settings as openIdSetting,
  certificates as openIdCertificates,
} from './openId';

export * from './accessService';
export * from './companyService';
export * from './emailService';
export * from './groupService';
export * from './logoService';
export * from './userService';

export * from './models';
export * from './storage';
export * from './constants';

export function register(container) {
  // models
  container.service('Company', createCompanyModel, 'mongooseConnection');
  container.service('Group', createGroupModel, 'mongooseConnection');
  container.service('User', createUserModel, 'mongooseConnection');
  container.service('Role', createRoleModel, 'Group');
  container.factory('models', c => ({
    Group: c.Group,
    Company: c.Company,
    User: c.User,
    Role: c.Role,
  }));

  // email client
  container.factory('EmailClient', ({ mailClientOptions }) =>
    promisifyAll(new M800MailClient(mailClientOptions)));

  // storage
  container.factory('gridFs', ({ mongoConnection }) =>
    promisifyAll(new Grid(mongoConnection, mongo)));
  container.service('gridFsStorage', createGridFsStorage, 'gridFs');

  // services
  container.service('AccessService', accessService, 'models');
  container.service('CompanyService', companyService, 'Company', 'LogoService');
  container.service('EmailService', emailService, 'EmailClient', 'mailServiceOptions');
  container.service('GroupService', groupService, 'models');
  container.service('LogoService', logoService, 'Company', 'gridFsStorage');
  container.service('UserService', userService, 'models', 'EmailService', 'logger');
  container.factory('services', c => ({
    accessService: c.AccessService,
    companyService: c.CompanyService,
    emailService: c.EmailService,
    groupService: c.GroupService,
    logoService: c.LogoService,
    userService: c.UserService,
  }));

  // load the openId setting
  container.constant('openIdSetting', openIdSetting);
  container.constant('openIdCertificates', openIdCertificates);
  container.service('openIdMongoAdapter', createOpenIdMongoAdapter, 'mongoConnection');
  container.service('openIdAccount', createAccount, 'UserService');
  container.service('openIdProvider', createOpenIdProvider, 'openIdOptions', 'openIdSetting',
   'openIdCertificates', 'openIdMongoAdapter', 'openIdAccount', 'SIGN_COOKIES_KEY', 'logger');

  return container;
}

export default register;
