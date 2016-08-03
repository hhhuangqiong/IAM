import { Provider } from 'oidc-provider/lib';
import Q from 'q';

import MongoAdapter from './adapters/mongodb';
import Account from './account';
import { config as openIdConfig, certificates } from './settings';
import { SIGN_COOKIES_KEY } from '../../constants/cookiesKey';

export function setUp(config) {
  // set up the mongo provider
  openIdConfig.adapter = MongoAdapter;
  // get the issuer from the config and prefix
  const issuer = `${config.get('APP_URL')}/openid/core`;
  const provider = new Provider(issuer, openIdConfig);
  provider.app.keys = SIGN_COOKIES_KEY;

  // set the property onto Account
  Object.defineProperty(provider, 'Account', {
    value: Account,
  });
  return Q.all(certificates.map(cert => provider.addKey(cert)))
    .then(() => Q.all(config.get('openid:clients').map(client => provider.addClient(client))))
    .then(() => provider);
}
