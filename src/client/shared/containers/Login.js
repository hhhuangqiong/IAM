import React, { Component, PropTypes } from 'react';
import _ from 'lodash';
import { defineMessages, injectIntl, intlShape, FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import bem from 'bem-cn';
import Joi from 'joi';
import COMMON_MESSAGES from '../intl/descriptors/common';
import { withIntlJoiValidation } from 'm800-user-locale';
import Button from 'm800-web-styleguide/lib/Button';
import Checkbox from 'm800-web-styleguide/lib/Form/Checkbox';
import FloatingLabelField from 'm800-web-styleguide/lib/Form/FloatingLabelField';
import AppLogo from '../components/AppLogo';

const LOGIN_ACTION_URL = '/openid/login';

const MESSAGES = defineMessages({
  invalidCredentials: {
    id: 'invalidCredentials',
    defaultMessage: 'Incorrect email or password.',
  },
  rememberMe: {
    id: 'rememberMe',
    defaultMessage: 'Remember Me',
  },
});

function getErrorMessage(errorCode) {
  return errorCode ? MESSAGES.invalidCredentials : null;
}


class Login extends Component {

  constructor(props) {
    super(props);

    this.assignRef = this.assignRef.bind(this);
    this.renderHelpText = this.renderHelpText.bind(this);
    this.onInputChange = this.onInputChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);

    this.state = {
      email: '',
      password: '',
    };

    this.refNodes = {};
  }

  onSubmit(e) {
    e.preventDefault();
    this.props.validate((error) => {
      if (!error) {
        this.refNodes.form.submit();
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
      email: this.refNodes.email.value.trim() || undefined,
      password: this.refNodes.password.value.trim() || undefined,
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

  assignRef(refName, innerRefPath) {
    return (ref) => {
      if (!ref) {
        this.refNodes[refName] = null;
        return;
      }
      this.refNodes[refName] = innerRefPath ? _.get(ref, innerRefPath) : ref;
    };
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
      <div className="row error-message error-text text-center">
        <FormattedHTMLMessage {...errorMessage} />
      </div>
    );
  }

  render() {
    const { appMeta, getValidationMessages, intl: { formatMessage } } = this.props;
    const resetPasswordUrl = `../resetPassword?clientId=${appMeta.clientId}&redirectURL=${encodeURIComponent(appMeta.redirectURL)}`;
    const classSets = bem('auth-section');

    return (
      <div className={classSets}>
        <AppLogo />
        <div className={classSets('main-block').mix('callout callout--white')}>
          <h3 className={classSets('title')}>
            <FormattedMessage id="login" defaultMessage="Login" />
          </h3>
          <form
            onSubmit={this.onSubmit}
            method="POST"
            action={LOGIN_ACTION_URL}
            ref={this.assignRef('form')}
          >
            <input type="hidden" name="grant" value={appMeta.grant} />
            <div className="row field-row">
              <FloatingLabelField
                className="column"
                errors={getValidationMessages('email')}
                labelText={formatMessage(COMMON_MESSAGES.email)}
                ref={this.assignRef('email', 'textInputRef.inputRef')}
                inputProps={{
                  name: 'id',
                  value: this.state.email,
                  onChange: this.onInputChange('email'),
                }}
              />
            </div>
            <div className="row field-row">
              <FloatingLabelField
                className="column"
                errors={getValidationMessages('password')}
                labelText={formatMessage(COMMON_MESSAGES.password)}
                ref={this.assignRef('password', 'textInputRef.inputRef')}
                inputProps={{
                  isPassword: true,
                  name: 'password',
                  value: this.state.password,
                  onChange: this.onInputChange('password'),
                }}
              />
            </div>
            {this.renderErrorMessage()}
            <div className="row action-row">
              <Button isExpanded type="submit">
                <FormattedMessage id="login" defaultMessage="Login" />
              </Button>
            </div>
            <div className="row align-justify">
              <div className="">
                <Checkbox
                  labelText={formatMessage(MESSAGES.rememberMe)}
                  name="remember"
                  defaultChecked
                />
              </div>
              <div className="">
                <a href={resetPasswordUrl} className="">
                  <FormattedMessage id="forgetPasswordQm" defaultMessage="Forget password?" />
                </a>
              </div>
            </div>
          </form>
        </div>
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

export default injectIntl(withIntlJoiValidation()(Login));
