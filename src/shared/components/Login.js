import React, { Component, PropTypes } from 'react';
import { defineMessages, injectIntl, intlShape, FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import Joi from 'joi';
import COMMON_MESSAGES from '../intl/descriptors/common';
import { injectJoiValidation } from 'm800-user-locale/joi-validation';

const LOGIN_ACTION_URL = '/openid/login';

const MESSAGES = defineMessages({
  invalidCredentials: {
    id: 'loginError',
    defaultMessage: 'Incorrect email or password.',
  },
});

function getErrorMessage(errorCode) {
  return errorCode ? MESSAGES.invalidCredentials : null;
}


class Login extends Component {

  constructor(props) {
    super(props);

    this.renderHelpText = this.renderHelpText.bind(this);
    this.onInputChange = this.onInputChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);

    this.state = {
      email: '',
      password: '',
    };
  }

  componentDidMount() {
    this.refs.email.focus();
  }

  onSubmit(e) {
    e.preventDefault();
    this.props.validate((error) => {
      if (!error) {
        this.refs.form.submit();
      }
    });
  }

  onInputChange(key) {
    return e => {
      this.props.validate(key);
      this.setState({ [key]: e.target.value.trim() });
    };
  }

  getValidatorData() {
    return {
      email: this.refs.email.value.trim() || undefined,
      password: this.refs.password.value.trim() || undefined,
    };
  }

  validatorTypes() {
    const { formatMessage } = this.props.intl;
    return Joi.object().keys({
      email: Joi.string()
        .trim()
        .email()
        .required()
        .label(formatMessage(COMMON_MESSAGES.email)),
      password: Joi.string()
        .trim()
        .required()
        .label(formatMessage(COMMON_MESSAGES.password)),
    });
  }

  renderHelpText(message, index) {
    return (
      <div key={index} className="text-alert text-small">{message}</div>
    );
  }

  renderErrorMessage() {
    const errorMessage = getErrorMessage(this.props.appMeta.error);

    if (!errorMessage) return null;

    return (
      <p className="error-message text-alert">
        <FormattedHTMLMessage {...errorMessage} />
      </p>
    );
  }

  render() {
    const { appMeta, getValidationMessages, intl: { formatMessage } } = this.props;
    const resetPasswordUrl = `../resetPassword?clientId=${appMeta.clientId}&redirectURL=${encodeURIComponent(appMeta.redirectURL)}`;

    return (
      <div className="account-password-section text-center">
        <div>
          {appMeta.details.reason_description}
        </div>
        <div className="large-text">
          <FormattedMessage id="loginAccount" defaultMessage="Login to your account" />
        </div>
        <div className="server-error-wrapper">
          {this.renderErrorMessage()}
        </div>
        <form onSubmit={this.onSubmit} method="POST" action={LOGIN_ACTION_URL} ref="form">
          <input type="hidden" name="grant" value={appMeta.grant} />
          <div className="panel text-left clearfix">
            <div className="input-wrapper">
              <input
                name="id"
                type="text"
                placeholder={formatMessage(COMMON_MESSAGES.email)}
                ref="email"
                value={this.state.email}
                onChange={this.onInputChange('email')}
              />
              <div className="inline-error-wrapper">
                {getValidationMessages('email').map(this.renderHelpText)}
              </div>
            </div>
            <div className="input-wrapper">
              <input
                name="password"
                type="password"
                placeholder={formatMessage(COMMON_MESSAGES.password)}
                ref="password"
                value={this.state.password}
                onChange={this.onInputChange('password')}
              />
              <div className="inline-error-wrapper">
                {getValidationMessages('password').map(this.renderHelpText)}
              </div>
            </div>
            <div className="">
              <label>
                <input
                  name="remember"
                  type="checkbox"
                  ref="remember"
                  defaultChecked
                />
                <FormattedMessage id="rememberMe" defaultMessage="Remember me" />
              </label>
            </div>
          </div>
          <div className="forget-password clearfix">
            <a href={resetPasswordUrl} className="dum-link left">
              <FormattedMessage id="forgetPassword" defaultMessage="Forget password?" />
            </a>
          </div>
          <div className="submit-wrapper">
            <button
              className="button primary radius expand"
              type="sumbit"
            >
              <FormattedMessage id="login" defaultMessage="Login" />
            </button>
          </div>
        </form>
      </div>
    );
  }
}

Login.propTypes = {
  appMeta: PropTypes.object.isRequired,
  intl: intlShape.isRequired,
  // react validation mixin props types
  errors: PropTypes.object,
  validate: PropTypes.func,
  isValid: PropTypes.func,
  handleValidation: PropTypes.func,
  getValidationMessages: PropTypes.func,
  clearValidations: PropTypes.func,
};

export default injectIntl(injectJoiValidation(Login));
