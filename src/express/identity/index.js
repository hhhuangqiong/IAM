import { getContainer } from '../../utils/ioc';

export function injectIdentityRoutes(server) {
  const { identityUserController, identityCompanyController } = getContainer();
  server.use('/identity', identityUserController, identityCompanyController);
}
