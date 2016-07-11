import logger from 'winston';
import nconf from 'nconf';

const CONFIG_PREFIX = 'env-';

/**
 * Initialize nconf settings
 *
 * @param {string} env development, test, or production
 * @param {string} configDir Where configuration file(s) are kept
 * @param {Object} opts
 * @param {string} [opts.envSeparator=__]
 * @return {Object} nconf
 */
export default function initialize(env, configDir, opts = { envSeparator: '__' }) {
  const fileName = `${CONFIG_PREFIX}${env}.json`;

  nconf.argv();
  nconf.env(opts.envSeparator);

  nconf.file(env, {
    file: fileName,
    dir: configDir,
    search: true,
  });

  logger.debug('loading configuration files %j under "%s"', fileName, configDir);
  return nconf;
}
