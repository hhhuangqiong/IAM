import { Provider } from 'oidc-provider/lib';
import Q from 'q';
import nconf from 'nconf';

import MongoAdapter from './adapters/mongodb';
import Account from './account';
import { config, certificates } from './settings';
import { SIGN_COOKIES_KEY } from '../../constants/cookiesKey';

export function getProvider() {
  // set up the mongo provider
  config.adapter = MongoAdapter;

  // get the issuer from the config and prefix
  const issuer = `${nconf.get('APP_URL')}/openid/core`;
  const provider = new Provider(issuer, config);
  provider.app.keys = SIGN_COOKIES_KEY;

  // set the property onto Account
  Object.defineProperty(provider, 'Account', {
    value: Account,
  });

  return Q.all(certificates.map(cert => provider.addKey(cert)))
    .then(() => provider);
}
