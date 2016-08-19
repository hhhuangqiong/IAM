import React from 'react';
import { render } from 'react-dom';
import Application from '../shared/components/Application';
import Login from '../shared/components/Login';

const appMeta = window.$APP_META || {};

render((
  <Application>
    <Login appMeta={appMeta} />
  </Application>
  ),
  document.getElementById('app')
);
