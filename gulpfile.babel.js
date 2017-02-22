import gulp from 'gulp';
import path from 'path';

import {
  createOneSkyUploadTask,
  createOneSkyDownloadTask,
} from 'm800-user-locale';

import { ONE_SKY as oneSkyConfig } from './src/config/credentials.json';
import { LOCALES as supportedLangs } from './src/config/app.json';

gulp.task('intl:download', createOneSkyDownloadTask({
  translationsDirectory: path.join(__dirname, 'src/client/shared/intl/messages'),
  languages: supportedLangs,
  oneSky: oneSkyConfig,
}));

gulp.task('intl:upload', createOneSkyUploadTask({
  translationsDirectory: path.join(__dirname, 'src/client/shared/intl/messages'),
  babelTranslationsDirectory: path.join(__dirname, 'build/messages'),
  oneSky: oneSkyConfig,
}));
