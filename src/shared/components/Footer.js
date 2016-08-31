import React, { PropTypes, Component } from 'react';
import localeUtil from 'm800-user-locale/util';
import Version from './Version';

class Footer extends Component {
  onLocaleSelectChange(e) {
    const lang = e.target.value;
    localeUtil.reloadWithLang(lang);
  }

  render() {
    return (
      <footer className="footer clearfix">
        <div className="right">
          <Version />
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
