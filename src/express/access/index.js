import { getContainer } from '../../utils/ioc';

export function injectAccessRoutes(server) {
  const { accessRoleController, accessUserController } = getContainer();
  server.use('/access', accessRoleController, accessUserController);
}
