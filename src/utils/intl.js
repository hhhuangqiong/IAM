import config from '../config/app';

export function getSupportedLangs() {
  const langSet = new Set();
  config.LOCALES.forEach((configLocale) => {
    langSet.add(configLocale.split('-')[0]);
  });
  return [...langSet];
}
