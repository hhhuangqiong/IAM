import React, { Component, PropTypes } from 'react';
import { injectIntl, intlShape, FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import { connect } from 'react-redux';
import Joi from 'joi';
import { injectJoiValidation } from 'm800-user-locale/joi-validation';
import requestResetPassword from '../actions/requestResetPassword';
import { SUCCESS, FAILURE } from '../../constants/actionStatus';
import COMMON_MESSAGES from '../intl/descriptors/common';

class ResetPassword extends Component {

  constructor(props) {
    super(props);

    this.onInputChange = this.onInputChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);

    this.state = {
      email: '',
    };
  }

  onInputChange(key) {
    return e => {
      this.setState({ [key]: e.target.value.trim() });
    };
  }

  onSubmit(e) {
    e.preventDefault();
    this.props.validate((error) => {
      if (error) {
        // do not submit if there's still validation error
        return;
      }
      const { clientId, redirectURL } = this.props.appMeta;
      this.props.requestResetPassword({
        id: this.state.email,
        clientId,
        redirectURL,
      });
    });
  }

  getValidatorData() {
    return {
      email: this.refs.email.value.trim() || undefined,
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
    });
  }

  renderHelpText(message, index) {
    return (
      <div key={index} className="text-alert text-small">{message}</div>
    );
  }

  renderMessage() {
    const { requestStatus } = this.props;

    if (requestStatus === FAILURE) {
      return (
        <p className="error-message text-alert">
          <FormattedMessage {...COMMON_MESSAGES.emailNotFound} />
        </p>
      );
    }

    if (requestStatus === SUCCESS) {
      return (
        <p className="text-alt">
          <FormattedMessage {...COMMON_MESSAGES.requestResetPasswordSuccess} />
        </p>
      );
    }

    return null;
  }

  render() {
    const { getValidationMessages, intl: { formatMessage } } = this.props;

    return (
      <div className="account-password-section text-center">
        <div className="large-text">
          <FormattedMessage id="forgetPassword" defaultMessage="Forget password?" />
        </div>
        <div className="text-dum">
          <FormattedHTMLMessage
            id="loginInstructions"
            defaultMessage="No worries!<br>Enter your email and we''ll send you login instructions"
          />
        </div>
        <div className="server-error-wrapper">
          {this.renderMessage()}
        </div>
        <form onSubmit={this.onSubmit} ref="form">
          <div className="panel text-left clearfix">
            <div className="input-wrapper">
              <input
                name="id"
                type="text"
                placeholder={formatMessage(COMMON_MESSAGES.email)}
                ref="email"
                value={this.state.email}
                onChange={this.onInputChange('email')}
                onBlur={this.props.handleValidation('email')}
              />
              <div className="inline-error-wrapper">
                {getValidationMessages('email').map(this.renderHelpText)}
              </div>
            </div>
          </div>
          <div className="submit-wrapper">
            <button className="button primary radius expand" type="sumbit">
              <FormattedMessage id="sendMeInstructions" defaultMessage="Send me instructions" />
            </button>
          </div>
        </form>
      </div>
    );
  }
}

ResetPassword.propTypes = {
  appMeta: PropTypes.object.isRequired,
  intl: intlShape.isRequired,
  requestStatus: PropTypes.string,
  requestError: PropTypes.object,
  requestResetPassword: PropTypes.func.isRequired,
  // react-validation-mixin proptypes
  errors: PropTypes.object,
  validate: PropTypes.func,
  isValid: PropTypes.func,
  handleValidation: PropTypes.func,
  getValidationMessages: PropTypes.func,
  clearValidations: PropTypes.func,
};

export default connect(
  (state) => state.requestResetPassword,
  { requestResetPassword }
)(injectIntl(injectJoiValidation(ResetPassword)));
