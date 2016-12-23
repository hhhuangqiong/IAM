import { getContainer } from '../../utils/ioc';

export function injectIdentityRoutes(server, { jsonParser }) {
  const {
    identityUserController,
    identityCompanyController,
    identityGroupController,
  } = getContainer();

  server.use('/identity',
    jsonParser,
    identityUserController,
    identityCompanyController,
    identityGroupController,
  );
}
