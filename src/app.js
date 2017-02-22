import { Bottle } from 'bottlejs';

import { register as registerInfrastructure } from './infrastructure';
import { register as registerServices } from './services';
import { register as registerApi } from './api';
import { register as registerServer } from './server';

export function create(config) {
  const app = new Bottle();

  const ENV = process.env.NODE_ENV || 'development';
  const serverOptions = {
    env: ENV,
    port: process.env.PORT || 3000,
  };
  const mailClientOptions = {
    baseUrl: config.MAIL_SERVICE_URL,
  };
  const openIdOptions = {
    appUrl: config.APP_URL,
    ...config.openid,
  };
  const mailServiceOptions = {
    appUrl: config.APP_URL,
    ...config.email,
  };
  const SIGN_COOKIES_KEY = ['openid', 'service'];

  app.constant('ENV', ENV);
  app.constant('LOCALES', config.LOCALES);
  app.constant('SIGN_COOKIES_KEY', SIGN_COOKIES_KEY);
  app.constant('logLevel', config.logLevel);
  app.constant('mongoOptions', config.mongodb);
  app.constant('serverOptions', serverOptions);
  app.constant('mailClientOptions', mailClientOptions);
  app.constant('mailServiceOptions', mailServiceOptions);
  app.constant('openIdOptions', openIdOptions);

  registerInfrastructure(app);
  registerServices(app);
  registerApi(app);
  registerServer(app);

  return app.container;
}

export default create;
