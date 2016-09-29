import React, { Component, PropTypes } from 'react';
import _ from 'lodash';
import { injectIntl, intlShape, FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import { connect } from 'react-redux';
import bem from 'bem-cn';
import Joi from 'joi';
import { injectJoiValidation } from 'm800-user-locale/joi-validation';
import Button from 'm800-web-styleguide/lib/Button';
import FloatingLabelField from 'm800-web-styleguide/lib/Form/FloatingLabelField';
import AppLogo from './AppLogo';
import requestResetPassword from '../actions/requestResetPassword';
import { SUCCESS, FAILURE } from '../../constants/actionStatus';
import COMMON_MESSAGES from '../intl/descriptors/common';

class ResetPassword extends Component {

  constructor(props) {
    super(props);

    this.assignRef = this.assignRef.bind(this);
    this.onInputChange = this.onInputChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);

    this.state = {
      email: '',
    };

    this.refNodes = {};
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
      email: this.refNodes.email.value.trim() || undefined,
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

  renderMessage() {
    const { requestStatus } = this.props;

    if (requestStatus === FAILURE) {
      return (
        <div className="row error-message error-text text-center">
          <FormattedMessage {...COMMON_MESSAGES.emailNotFound} />
        </div>
      );
    }

    if (requestStatus === SUCCESS) {
      return (
        <div className="row color-success text-center">
          <FormattedMessage {...COMMON_MESSAGES.requestResetPasswordSuccess} />
        </div>
      );
    }

    return null;
  }

  render() {
    const { getValidationMessages, intl: { formatMessage } } = this.props;
    const classSets = bem('auth-section');

    return (
      <div className={classSets}>
        <AppLogo />
        <div className={classSets('main-block').mix('callout callout--white')}>
          <h3 className={classSets('title')}>
            <FormattedMessage id="forgetPassword" defaultMessage="Forget password" />
          </h3>
          <form onSubmit={this.onSubmit} ref="form">
            <div className="row">
              <FormattedHTMLMessage
                id="loginInstructions"
                defaultMessage="No worries! Enter your email and we''ll send you login instructions"
              />
            </div>
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
                  onBlur: this.props.handleValidation('email'),
                }}
              />
            </div>
            {this.renderMessage()}
            <div className="row action-row">
              <Button isExpanded type="submit">
                <FormattedMessage id="sendMeInstructions" defaultMessage="Send me instructions" />
              </Button>
            </div>
          </form>
        </div>
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
