import { getContainer } from '../../utils/ioc';

export function injectAccessRoutes(server, { jsonParser, overrideMethod }) {
  const { accessRoleController, accessUserController } = getContainer();
  // set up the route for access and identity

  server.use('/access', jsonParser, overrideMethod,
    accessRoleController, accessUserController);
}
