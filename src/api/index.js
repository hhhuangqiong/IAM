import {
  companyController,
  groupController,
  openIdController,
  roleController,
  userController,
  userRoleController,
} from './controllers';
import {
  createDecodeParamsMiddleware,
  createErrorMiddleware,
} from './middlewares';
import api from './api';

export function register(container) {
  // controllers
  container.service('CompanyController', companyController, 'CompanyService', 'LogoService');
  container.service('GroupController', groupController, 'GroupService');
  container.service('OpenIdController', openIdController, 'openIdProvider', 'UserService', 'logger', 'ENV');
  container.service('RoleController', roleController, 'AccessService');
  container.service('UserController', userController, 'UserService');
  container.service('UserRoleController', userRoleController, 'AccessService');
  container.factory('controllers', c => ({
    companyController: c.CompanyController,
    groupController: c.GroupController,
    openIdController: c.OpenIdController,
    roleController: c.RoleController,
    userController: c.UserController,
    userRoleController: c.UserRoleController,
  }));

  // middlewares
  container.service('DecodeParamsMiddleware', createDecodeParamsMiddleware);
  container.service('ErrorMiddleware', createErrorMiddleware, 'logger', 'ENV');
  container.factory('middlewares', c => ({
    decodeParamsMiddleware: c.DecodeParamsMiddleware,
    errorMiddleware: c.ErrorMiddleware,
  }));

  container.service('api', api, 'controllers', 'middlewares', 'openIdProvider', 'SIGN_COOKIES_KEY');
}
export default register;

export * from './controllers';
export * from './middlewares';
