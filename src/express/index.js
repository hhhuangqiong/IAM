import bodyParser from 'body-parser';
import methodOverride from 'method-override';

import { injectAccessRoutes } from './access';
import { injectIdentityRoutes } from './identity';
import { injectOpenIdRoutes } from './openid';
import { getContainer } from '../utils/ioc' ;

export default function injectExpress(server) {
  const jsonParser = bodyParser.json();
  const urlencodedParser = bodyParser.urlencoded({
    extended: true,
  });
  // To enable using PUT, DELETE METHODS
  const overrideMethod = methodOverride('_method');
  const { decodeParamsMiddleware } = getContainer();

  // apply decode for all express routes
  server.use(decodeParamsMiddleware);

  // set up the route for access and identity
  injectAccessRoutes(server, {
    urlencodedParser,
    jsonParser,
    overrideMethod,
  });

  injectIdentityRoutes(server, {
    urlencodedParser,
    jsonParser,
    overrideMethod,
  });

  injectOpenIdRoutes(server);

  return server;
}
