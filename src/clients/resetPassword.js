import React from 'react';
import { render } from 'react-dom';
import Application from '../shared/components/Application';
import ResetPassword from '../shared/components/ResetPassword';

const appMeta = window.$APP_META || {};

render((
  <Application currentLang={appMeta.locale}>
    <ResetPassword appMeta={appMeta} />
  </Application>
  ),
  document.getElementById('app')
);
