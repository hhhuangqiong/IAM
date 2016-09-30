import { Provider } from 'oidc-provider/lib';
import Q from 'q';
import _ from 'lodash';
import logger from 'winston';

import MongoAdapter from './adapters/mongodb';
import Account from './account';
import { SIGN_COOKIES_KEY } from '../../constants/cookiesKey';

export function setUp(config, openIdConfig, certificates) {
  // set up the mongo provider
  const providerConfig = openIdConfig;
  providerConfig.adapter = MongoAdapter;

  // get the issuer from the config and prefix
  const issuer = `${config.get('APP_URL')}/openid/core`;
  const provider = new Provider(issuer, providerConfig);
  provider.app.keys = SIGN_COOKIES_KEY;

  // set the property onto Account
  Object.defineProperty(provider, 'Account', {
    value: Account,
  });

  // log all the errors
  const errorType = ['server_error', 'authorization.error', 'end_session.error',
  'introspection.error', 'discovery.error', 'grant.error', 'userinfo.error', 'revocation.error'];

  _.each(errorType, type => {
    provider.on(type, error => {
      logger.error(`[OPENID]${type}:`, error);
    });
  });

  return Q.all(certificates.map(cert => provider.addKey(cert)))
    .then(() => Q.all(_.map(config.get('openid:clients'), (client, key) => {
      const mClient = client;
      // set back the client id
      mClient.client_id = key;
      // if import from env variable, it will be string only
      // convert back into arrays
      if (typeof client.grant_types === 'string') {
        mClient.grant_types = client.grant_types.split(',');
      }
      if (typeof client.redirect_uris === 'string') {
        mClient.redirect_uris = client.redirect_uris.split(',');
      }
      if (typeof client.post_logout_redirect_uris === 'string') {
        mClient.post_logout_redirect_uris = client.post_logout_redirect_uris.split(',');
      }

      // force to use the secret jwt and HS512 signing alg
      mClient.token_endpoint_auth_method = 'client_secret_jwt';
      mClient.token_endpoint_auth_signing_alg = 'HS512';

      return provider.addClient(mClient);
    })))
    .then(() => provider);
}
