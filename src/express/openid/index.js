import express from 'express';
import _ from 'lodash';
import { createEngine } from 'express-react-views';
import path from 'path';
import cookies from 'cookies';
import userLocale from 'm800-user-locale';

import config from '../../config/app.json';
import { getContainer } from '../../utils/ioc';
import { SIGN_COOKIES_KEY } from '../../constants/cookiesKey';

const isDevelopment = process.env.NODE_ENV !== 'production';

export function injectOpenIdRoutes(server) {
  userLocale.initializer(server, config.LOCALES);
  // TODO: Better wepback config!
  const staticServer = express.static(path.join('public/'));
  server.use((req, res, next) => {
    // Allow webpack dev middleware to serve this files
    if (isDevelopment && _.startsWith(req.path, '/assets/app')) {
      next();
      return;
    }
    staticServer(req, res, next);
  });
  const { openIdController } = getContainer();
  // set the view engine
  server.set('views', path.resolve(__dirname, '../../views'));
  server.set('view engine', 'js');
  server.engine('js', createEngine({ transformViews: false }));
  server.use('/openid', cookies.express(SIGN_COOKIES_KEY), openIdController);
}
