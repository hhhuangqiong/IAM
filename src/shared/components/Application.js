import React, { PropTypes } from 'react';
import { IntlProvider } from 'react-intl';
import { Provider as ReduxProvider } from 'react-redux';
import M800ThemeProvider from 'm800-web-styleguide/lib/common/M800ThemeProvider';
import configureStore from '../store/configureStore';

import '../../../public/sass/main.scss';

require('es6-promise').polyfill();

const store = configureStore();

// config class namesapce and BEM syntax
const bem = require('bem-cn').setup({ ns: 'iam-', el: '__', mod: '--' });

const Application = (props) => {
  const currentLang = props.currentLang;
  const messages = require(`../intl/messages/${currentLang}.json`); // eslint-disable-line global-require

  return (
    <IntlProvider locale={currentLang} messages={messages}>
      <M800ThemeProvider bem={bem}>
        <ReduxProvider store={store}>
          {props.children}
        </ReduxProvider>
      </M800ThemeProvider>
    </IntlProvider>
  );
};

Application.propTypes = {
  children: PropTypes.node,
  currentLang: PropTypes.string,
};

Application.defaultProps = {
  currentLang: 'en',
};

export default Application;
