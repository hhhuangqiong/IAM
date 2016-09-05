import React, { PropTypes } from 'react';
import { PolyfillIntl } from '../utils/intl';
const bundlePath = '/assets/app/';

const App = ({ page, appMeta }) => (
  <html lang={appMeta.locale}>
    <head>
      <PolyfillIntl />
    </head>
    <body>
      <div id="app">
      </div>
      <script type="text/javascript" dangerouslySetInnerHTML={{ __html: `window.$APP_META = ${JSON.stringify(appMeta)}` }} />
      <script type="text/javascript" src={`${bundlePath}${page}.bundle.js`} />
    </body>
  </html>
);

App.propTypes = {
  appMeta: PropTypes.object,
  page: PropTypes.string.isRequired,
};

export default App;
