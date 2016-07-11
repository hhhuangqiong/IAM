import { router as accessRouter } from './access';
import { router as identityRouter } from './identity';

const ACCESS_PREFIX = '/access';
const IDENTITY_PREFIX = '/identity';

export default function injectExpress(server) {
  // set up the route for access and identity
  server.use(ACCESS_PREFIX, accessRouter);
  server.use(IDENTITY_PREFIX, identityRouter);

  return server;
}
