
import { createEngine } from 'express-react-views';
import path from 'path';
import cookies from 'cookies';

import { getContainer } from '../../utils/ioc';
import { SIGN_COOKIES_KEY } from '../../constants/cookiesKey';

export function injectOpenIdRoutes(server, { urlencodedParser }) {
  const { openIdController } = getContainer();
  // set the view engine
  server.set('views', path.resolve(__dirname, '../../views'));
  server.set('view engine', 'js');
  server.engine('js', createEngine());
  server.use('/openid', cookies.express(SIGN_COOKIES_KEY), urlencodedParser, openIdController);
}
