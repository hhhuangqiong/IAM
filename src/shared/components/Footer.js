import React, { PropTypes, Component } from 'react';
import bem from 'bem-cn';
import localeUtil from 'm800-user-locale/util';
import Icon from 'm800-web-styleguide/lib/Icon';
import Version from './Version';

class Footer extends Component {
  onLocaleSelectChange(e) {
    const lang = e.target.value;
    localeUtil.reloadWithLang(lang);
  }

  render() {
    const classSets = bem('footer');

    return (
      <footer className={classSets}>
        <div className={classSets('left-block')}>
          <a target="_blank" href="http://www.m800.com">M800</a>
        </div>
        <div className={classSets('right-block')}>
          <Version />
          <Icon symbolName="earth" />
          <select
            className="locale-select"
            defaultValue={this.props.currentLang}
            onChange={this.onLocaleSelectChange}
          >
            {this.props.supportedLangs.map(lang => <option key={lang} value={lang}>
              {localeUtil.getLangNativeName(lang)}
            </option>)}
          </select>
        </div>
      </footer>
    );
  }
}

Footer.propTypes = {
  currentLang: PropTypes.string.isRequired,
  supportedLangs: PropTypes.array.isRequired,
};

export default Footer;
