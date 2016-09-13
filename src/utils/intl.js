import React from 'react';
import config from '../config/app';

export function getSupportedLangs() {
  const langSet = new Set();
  config.LOCALES.forEach((configLocale) => {
    langSet.add(configLocale.split('-')[0]);
  });
  return [...langSet];
}

// Use the Polyfill service to do intl polyfill:
// https://github.com/andyearnshaw/Intl.js
export function polyfillIntl(locale) {
  let langs = [];
  let featuresStr = '';
  if (locale) {
    langs.push(locale.split('-')[0]);
  } else {
    langs = getSupportedLangs();
  }
  langs.forEach((lang) => {
    featuresStr += `Intl.~locale.${lang},`;
  });
  return (
    <script src={`https://cdn.polyfill.io/v2/polyfill.min.js?features=${featuresStr}`}></script>
  );
}
