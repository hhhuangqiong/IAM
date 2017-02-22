import React, { PropTypes } from 'react';
import { getSupportedLangs } from '../../utils/intl';
const bundlePath = '/assets/app/';

// Use the Polyfill service to do intl polyfill:
// https://github.com/andyearnshaw/Intl.js
function polyfillIntl(locale) {
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

const App = ({ page, appMeta, env }) => (
  <html lang={appMeta.locale}>
    <head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      <title>M800</title>
      {env === 'development' ? null : <link rel="stylesheet" href={`${bundlePath}style.css`} />}
      {polyfillIntl(appMeta.locale)}
    </head>
    <body>
      <div id="app">
      </div>
      <script type="text/javascript" dangerouslySetInnerHTML={{ __html: `window.$APP_META = ${JSON.stringify(appMeta)}` }} />
      <script type="text/javascript" src={`${bundlePath}common.bundle.js`} />
      <script type="text/javascript" src={`${bundlePath}${page}.bundle.js`} />
    </body>
  </html>
);

App.propTypes = {
  appMeta: PropTypes.object,
  page: PropTypes.string.isRequired,
  env: PropTypes.string,
};

export default App;
