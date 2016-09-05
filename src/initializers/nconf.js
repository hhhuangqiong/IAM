import logger from 'winston';
import nconf from 'nconf';
import path from 'path';

const CONFIG_PREFIX = 'env-';

/**
 * Initialize nconf settings
 * @return {Object} nconf
 */
export default function initialize() {
  const env = process.env.NODE_ENV || 'development';
  const configDir = path.resolve(__dirname, '../config');
  const fileName = `${CONFIG_PREFIX}${env}.json`;

  nconf.argv();
  nconf.env('__');

  nconf.file(env, {
    file: fileName,
    dir: configDir,
    search: true,
  });

  // default env config
  nconf.file('default', {
    file: 'default.json',
    dir: configDir,
    search: true,
  });

  logger.debug('loading configuration files %j under "%s"', fileName, configDir);
  return nconf;
}
