import express from 'express';
import { createEngine } from 'express-react-views';
import path from 'path';
import cookies from 'cookies';
import userLocale from 'm800-user-locale';

import config from '../../config/app.json';
import { getContainer } from '../../utils/ioc';
import { SIGN_COOKIES_KEY } from '../../constants/cookiesKey';

export function injectOpenIdRoutes(server) {
  userLocale.initializer(server, config.LOCALES);
  server.use(express.static(path.join('public/')));

  const { openIdController } = getContainer();
  // set the view engine
  server.set('views', path.resolve(__dirname, '../../views'));
  server.set('view engine', 'js');
  server.engine('js', createEngine({ transformViews: false }));
  server.use('/openid', cookies.express(SIGN_COOKIES_KEY), openIdController);
}
