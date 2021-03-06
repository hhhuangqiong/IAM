import nconf from 'nconf';
import path from 'path';

const ROOT = __dirname;
const ENV = process.env.NODE_ENV || 'development';

nconf
  .argv()
  .env({ separator: '__' })
  .file('app', path.join(ROOT, 'app.json'))
  .file('env-user-file', path.join(ROOT, `${ENV}.personal.json`))
  .file('env-file', path.join(ROOT, `${ENV}.json`))
  .file('default-user-file', path.join(ROOT, 'default.personal.json'))
  .file('default-file', path.join(ROOT, 'default.json'));

const config = nconf.get();

export default config;
