import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import Joi from 'joi';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';
import { injectJoiValidation } from 'm800-user-locale/joi-validation';
import Icon from 'm800-web-styleguide/lib/Icon';
import setPassword from '../actions/setPassword';
import { SUCCESS, FAILURE } from '../../constants/actionStatus';
import COMMON_MESSAGES from '../intl/descriptors/common';

class SetPassword extends Component {
  constructor(props) {
    super(props);
    this.state = {
      submitStatus: false,
      validation: {
        passwordCharacter: false,
        passwordNumber: false,
        passwordLength: false,
        confirmPassword: false,
      },
      showValidator: false,
    };
    this.onSubmit = this.onSubmit.bind(this);
    this.validateForm = this.validateForm.bind(this);
    this.handleFocus = this.handleFocus.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
    this.successRedirect = this.successRedirect.bind(this);
  }

  componentDidMount() {
    this.refs.email.focus();

    if (this.props.requestStatus === SUCCESS) {
      this.successRedirect();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.requestStatus === SUCCESS) {
      this.successRedirect();
    }
  }

  onSubmit(e) {
    e.preventDefault();

    this.props.validate((error) => {
      if (error) {
        return;
      }
      const { clientId, event, id, token } = this.props.appMeta;
      this.props.setPassword({
        password: this.refs.password.value,
        clientId,
        event,
        id,
        token,
      });
    });
  }

  // use virtual fields for matching different validation rules
  getValidatorData() {
    return {
      passwordCharacter: this.refs.password.value,
      passwordNumber: this.refs.password.value,
      passwordLength: this.refs.password.value,
      confirmPassword: this.refs.confirmPassword.value,
    };
  }

  validatorTypes() {
    return Joi.object().keys({
      // both upper and lower
      passwordCharacter: Joi.string().required().regex(/(?=.*[a-z])(?=.*[A-Z]).{2,}/),
      // number and symbol
      passwordNumber: Joi.string().required().regex(/[0-9!@#\$%\^&*\(\)]+/),
      // length
      passwordLength: Joi.string().required().min(8),
      confirmPassword: Joi.ref('passwordCharacter'),
    });
  }

  validateForm() {
    this.props.validate((error) => {
      const state = {
        submitStatus: true,
        validation: {
          passwordCharacter: true,
          passwordNumber: true,
          passwordLength: true,
          confirmPassword: true,
        },
      };

      if (error) {
        Object.keys(error).forEach((key) => {
          state.validation[key] = false;
        });
        state.submitStatus = false;
      }

      this.setState(state);
    });
  }

  handleFocus() {
    this.setState({
      showValidator: true,
    });
  }

  handleBlur() {
    this.setState({
      showValidator: false,
    });
  }

  successRedirect() {
    window.location = this.props.appMeta.redirectURL;
  }

  renderMessage() {
    const { requestStatus } = this.props;

    if (requestStatus === FAILURE) {
      return (
        <p className="error-message text-alert">
          <FormattedMessage {...COMMON_MESSAGES.operationFail} />
        </p>
      );
    }

    if (requestStatus === SUCCESS) {
      return (
        <p className="text-alt">
          <FormattedMessage {...COMMON_MESSAGES.resetPasswordSuccess} />
        </p>
      );
    }

    return null;
  }

  renderValidatorIcon(isValid) {
    return isValid ?
      <Icon symbolName="tick" color="success" /> :
      <Icon symbolName="info-circle-o" color="alert" />;
  }

  renderValidator() {
    const {
      showValidator,
      validation: { passwordCharacter, passwordNumber, passwordLength },
    } = this.state;
    if (!showValidator) {
      return null;
    }
    return (
      <div className="reset-password-page__validator">
        <div className="reset-password-page__arrow"></div>
        <div className="reset-password-page__validator__container">
          <div className="reset-password-page__validator__container__title">
            <FormattedMessage id="passwordValidatorTitle" defaultMessage="Your password needs to" />:
          </div>
          <div className="reset-password-page__validator__container__row">
            {this.renderValidatorIcon(passwordCharacter)}
            <FormattedMessage id="passwordValidatorCharacter" defaultMessage="Include both upper and lower case characters" />
          </div>
          <div className="reset-password-page__validator__container__row">
            {this.renderValidatorIcon(passwordNumber)}
            <FormattedMessage id="passwordValidatorNumber" defaultMessage="Include at least one number or symbol" />
          </div>
          <div className="reset-password-page__validator__container__row">
            {this.renderValidatorIcon(passwordLength)}
            <FormattedMessage id="passwordValidatorLength" defaultMessage="Be at least 8 characters" />
          </div>
        </div>
      </div>
    );
  }

  render() {
    const { formatMessage } = this.props.intl;

    return (
      <div className="reset-password-page text-center">
        <div className="large-text">
          <FormattedMessage id="changePassword" defaultMessage="Change Password" />
        </div>

        <div className="server-error-wrapper">
          {this.renderMessage()}
        </div>

        <form onSubmit={this.onSubmit} >
          <div className="panel text-left">
            <div className="input-wrapper">
              <input
                type="text"
                placeholder={formatMessage(COMMON_MESSAGES.email)}
                ref="email"
                value={this.props.appMeta.id}
                disabled
              />
            </div>

            {this.renderValidator()}

            <div className="inline-error-wrapper"></div>
            <div className="input-wrapper">
              <input
                type="password"
                placeholder={formatMessage(COMMON_MESSAGES.password)}
                ref="password"
                defaultValue={this.state.password}
                onChange={this.validateForm}
                onFocus={this.handleFocus}
                onBlur={this.handleBlur}
              />
            </div>

            <div className="inline-error-wrapper"></div>
            <div className="input-wrapper">
              <input
                type="password"
                placeholder={formatMessage(COMMON_MESSAGES.confirmPassword)}
                ref="confirmPassword"
                defaultValue={this.state.confirmPassword}
                onChange={this.validateForm}
              />
            </div>
            <div className="inline-error-wrapper"></div>
          </div>

          <div className="submit-wrapper">
            <button
              className="button primary radius expand reset-password-page__submit"
              disabled={this.props.requestStatus === SUCCESS || !this.state.submitStatus}
            >
              <FormattedMessage id="changePassword" defaultMessage="Change Password" />
            </button>
          </div>
        </form>

      </div>
    );
  }
}

SetPassword.propTypes = {
  appMeta: PropTypes.object.isRequired,
  intl: intlShape.isRequired,
  requestStatus: PropTypes.string,
  requestError: PropTypes.object,
  setPassword: PropTypes.func.isRequired,
  // react validation mixin props types
  errors: PropTypes.object,
  validate: PropTypes.func,
  isValid: PropTypes.func,
  handleValidation: PropTypes.func,
  getValidationMessages: PropTypes.func,
  clearValidations: PropTypes.func,
};

export default connect(
  (state) => state.setPassword,
  { setPassword }
)(injectIntl(injectJoiValidation(SetPassword)));
