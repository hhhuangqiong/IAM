import { Provider } from 'oidc-provider/lib';
import { check } from 'm800-util';
import Promise from 'bluebird';
import _ from 'lodash';
import Joi from 'joi';

export function createOpenIdProvider(config, openIdSetting, certificates,
  MongoAdapter, Account, SIGN_COOKIES_KEY, logger) {
  check.schema('config', config, Joi.object({
    appUrl: Joi.string().required(),
    clients: Joi.object(),
  }));
  check.ok('openIdSetting', openIdSetting);
  check.ok('certificates', certificates);
  check.ok('MongoAdapter', MongoAdapter);
  check.ok('logger', logger);

  // set up the mongo provider
  const providerConfig = openIdSetting;
  providerConfig.adapter = MongoAdapter;

  // get the issuer from the config and prefix
  const issuer = `${config.appUrl}/openid/core`;
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
      logger.error(`[OPENID]${type}: %%`, error, error.message);
    });
  });

  async function registerClient() {
    for (const cert of certificates) {
      await provider.addKey(cert);
    }

    await Promise.all(_.map(config.clients, async (client, key) => {
      logger.info('registering openid client', client);
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
      await provider.addClient(mClient);
    }));

    return provider;
  }

  function getProvider() {
    return provider;
  }

  return {
    getProvider,
    registerClient,
  };
}

export default createOpenIdProvider;
