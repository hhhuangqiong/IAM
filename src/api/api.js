import { Router } from 'express';
import { NotFoundError } from 'common-errors';
import { check } from 'm800-util';
import cookies from 'cookies';
import bodyParser from 'body-parser';
import multer from 'multer';
import { tmpdir } from 'os';

// multer to handle multipart upload file
const multerUpload = multer({ dest: tmpdir() });

export function api(controllers, middlewares, openIdProvider, SIGN_COOKIES_KEY) {
  check.members('controllers', controllers, [
    'companyController',
    'groupController',
    'openIdController',
    'roleController',
    'userController',
    'userRoleController',
  ]);
  check.members('middlewares', middlewares, [
    'decodeParamsMiddleware',
    'errorMiddleware',
  ]);
  check.ok('openIdProvider', openIdProvider);

  const {
    companyController,
    groupController,
    openIdController,
    roleController,
    userController,
    userRoleController,
  } = controllers;
  const {
    errorMiddleware,
    decodeParamsMiddleware,
  } = middlewares;

  const router = new Router();
  router.use(decodeParamsMiddleware);
  router.use(bodyParser.json());

  // company
  router.post('/identity/companies', companyController.postCompany);
  router.get('/identity/companies', companyController.getCompanies);
  router.get('/identity/companies/:id', companyController.getCompany);
  router.get('/identity/companies/:id/descendants', companyController.getDescendantCompanies);
  router.delete('/identity/companies/:id', companyController.deleteCompany);
  router.put('/identity/companies/:id', companyController.putCompany);
  router.post('/identity/companies/:id/logo', multerUpload.single('logo'), companyController.postLogo);
  router.get('/identity/companies/logo/:id', companyController.getLogo);
  router.delete('/identity/companies/:id/logo', companyController.deleteLogo);

  // user
  router.post('/identity/users', userController.postUser);
  router.post('/identity/users/:id/requestSetPassword', userController.requestSetPassword);
  router.get('/identity/users', userController.getUsers);
  router.get('/identity/users/:id', userController.getUser);
  router.delete('/identity/users/:id', userController.deleteUser);
  router.put('/identity/users/:id', userController.putUser);

  // group
  router.get('/identity/groups', groupController.listGroups);
  router.get('/identity/groups/:groupId/users', groupController.listGroupUsers);
  router.get('/identity/groups/:groupId', groupController.getGroup);
  router.post('/identity/groups', groupController.createGroup);
  router.put('/identity/groups/:groupId', groupController.updateGroup);
  router.delete('/identity/groups/:groupId', groupController.removeGroup);

  // access
  router.post('/access/roles', roleController.postRole);
  router.get('/access/roles', roleController.getRoles);
  router.delete('/access/roles/:roleId', roleController.deleteRole);
  router.put('/access/roles/:roleId', roleController.updateRole);

  // access user role
  router.get('/access/users/:username/roles', userRoleController.getUserRoles);
  router.put('/access/users/:username/roles', userRoleController.setUserRoles);
  router.get('/access/users/:username/permissions', userRoleController.getUserPermissions);

  // openid
  router.use('/openid', cookies.express(SIGN_COOKIES_KEY));
  router.get('/openid/resetPassword', openIdController.resetPasswordPage);
  router.get('/openid/setPassword', openIdController.setPasswordPage);
  // submit as www-form-urlencoded in order to perform redirection in the openid provider
  router.post('/openid/login', bodyParser.urlencoded({ extended: true }), openIdController.login);
  router.post('/openid/resetPassword', openIdController.requestResetPassword);
  router.post('/openid/setPassword', openIdController.setPassword);

  // openid provider
  router.get('/openid/interaction/:grant', openIdController.viewLoginPage);
  router.use('/openid/core', openIdProvider.getProvider().app.callback());

  router.use((req, res, next) => {
    next(new NotFoundError(req.path));
  });
  router.use(errorMiddleware);

  return router;
}

export default api;
