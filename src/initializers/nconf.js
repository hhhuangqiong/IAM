import nconf from 'nconf';
import path from 'path';

const CONFIG_DIR = path.resolve(__dirname, '../config');

export default function initialize() {
  const env = process.env.NODE_ENV || 'development';
  nconf
    .argv()
    .env('__')
    .file('user-env-specific', path.join(CONFIG_DIR, `server-${env}.personal.config.json`))
    .file('env-specific', path.join(CONFIG_DIR, `server-${env}.config.json`))
    .file('default', path.join(CONFIG_DIR, 'server-default.config.json'));
  return nconf;
}
