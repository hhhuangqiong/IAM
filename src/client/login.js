import React from 'react';
import { render } from 'react-dom';
import { Application } from './shared/components';
import { Login } from './shared/containers';

const appMeta = window.$APP_META || {};

render((
  <Application currentLang={appMeta.locale}>
    <Login appMeta={appMeta} />
  </Application>
  ),
  document.getElementById('app')
);
