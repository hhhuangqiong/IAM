import React, { PropTypes } from 'react';
const bundlePath = '/assets/app/';

const App = ({ page, appMeta }) => (
  <html lang={appMeta.locale}>
    <head>
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
