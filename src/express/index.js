import { injectAccessRoutes } from './access';
import { injectIdentityRoutes } from './identity';

export default function injectExpress(server) {
  // set up the route for access and identity
  injectAccessRoutes(server);
  injectIdentityRoutes(server);
  return server;
}
