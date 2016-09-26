import React, { Component, PropTypes } from 'react';
import { addLocaleData, IntlProvider } from 'react-intl';
import { Provider as ReduxProvider } from 'react-redux';
import InlineSVG from 'svg-inline-react';
import M800ThemeProvider from 'm800-web-styleguide/lib/M800ThemeProvider';
import configureStore from '../store/configureStore';
import Footer from './Footer';

import config from '../../config/app.json';

import symbol from 'm800-web-styleguide/assets/symbols/symbol-defs.svg';
import '../../../public/sass/main.scss';

require('es6-promise').polyfill();

const locales = config.LOCALES;

const store = configureStore();

// config class namesapce and BEM syntax
const bem = require('bem-cn').setup({ el: '__', mod: '--' });

locales.forEach(locale => {
  const lang = locale.split('-')[0];
  addLocaleData(require(`react-intl/locale-data/${lang}`)); // eslint-disable-line global-require
});

class Application extends Component {
  constructor(props) {
    super(props);
    const { currentLang } = props;
    try {
      this.messages = require(`../intl/messages/${currentLang}.json`); // eslint-disable-line global-require
    } catch (e) {
      // prevent error thorwn when the message json is empty
      this.messages = {};
    }
  }

  render() {
    const { children, currentLang } = this.props;
    return (
      <ReduxProvider store={store}>
        <IntlProvider locale={currentLang} messages={this.messages}>
          <M800ThemeProvider bem={bem}>
            <InlineSVG src={symbol} />
            {children}
            <Footer currentLang={currentLang} supportedLangs={locales} />
          </M800ThemeProvider>
        </IntlProvider>
      </ReduxProvider>
    );
  }
}

Application.propTypes = {
  children: PropTypes.node,
  currentLang: PropTypes.string,
};

Application.defaultProps = {
  currentLang: locales[0],
};

export default Application;
