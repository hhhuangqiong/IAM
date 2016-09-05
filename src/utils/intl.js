import React from 'react';
import config from '../config/app';

// Use the Polyfill service to do intl polyfill:
// https://github.com/andyearnshaw/Intl.js
export const PolyfillIntl = () => {
  const localeSet = new Set();
  let featuresStr = '';
  config.LOCALES.forEach((locale) => {
    localeSet.add(locale.split('-')[0]);
  });
  localeSet.forEach((lang) => {
    featuresStr += `Intl.~locale.${lang},`;
  });
  return (
    <script src={`https://cdn.polyfill.io/v2/polyfill.min.js?features=${featuresStr}`}></script>
  );
};
