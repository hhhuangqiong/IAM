import { getContainer } from '../../utils/ioc';

export function injectIdentityRoutes(server, { jsonParser, urlencodedParser, overrideMethod }) {
  const { identityUserController, identityCompanyController } = getContainer();

  server.use('/identity', jsonParser, urlencodedParser, overrideMethod,
    identityUserController, identityCompanyController);
}
