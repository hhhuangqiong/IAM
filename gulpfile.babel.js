import gulp from 'gulp';
import path from 'path';

import injectM800LocaleGulpTasks from 'm800-user-locale/gulpTasks';
import { ONE_SKY as oneSkyConfig } from './src/config/credentials.json';
import { LOCALES as supportedLangs } from './src/config/app.json';

const INTL_MESSAGES_PATTERN = './build/intl/**/*.json';

const ROOT = __dirname;
const PATHS = {
  INTL_DIR: path.join(ROOT, 'src/shared/intl/messages'),
};

injectM800LocaleGulpTasks(gulp, {
  messages: [INTL_MESSAGES_PATTERN],
  source: PATHS.INTL_DIR,
  languages: supportedLangs,
  oneSky: oneSkyConfig,
});
