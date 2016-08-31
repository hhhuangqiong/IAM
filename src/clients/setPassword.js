import React from 'react';
import { render } from 'react-dom';
import Application from '../shared/components/Application';
import SetPassword from '../shared/components/SetPassword';

const appMeta = window.$APP_META || {};

render((
  <Application currentLang={appMeta.locale}>
    <SetPassword appMeta={appMeta} />
  </Application>
  ),
  document.getElementById('app')
);
