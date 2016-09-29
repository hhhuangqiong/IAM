import React, { PropTypes } from 'react';
import { polyfillIntl } from '../utils/intl';
const env = process.env.NODE_ENV || 'development';
const bundlePath = '/assets/app/';

const App = ({ page, appMeta }) => (
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
};

export default App;
