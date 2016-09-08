import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import bem from 'bem-cn';
import Joi from 'joi';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';
import { injectJoiValidation } from 'm800-user-locale/joi-validation';
import Button from 'm800-web-styleguide/lib/Button';
import Field from 'm800-web-styleguide/lib/Form/Field';
import Icon from 'm800-web-styleguide/lib/Icon';
import PointerBox from 'm800-web-styleguide/lib/Box/PointerBox';
import TextInput from 'm800-web-styleguide/lib/Form/TextInput';
import AppLogo from './AppLogo';
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
    this.assignRef = this.assignRef.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.validateForm = this.validateForm.bind(this);
    this.handleFocus = this.handleFocus.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
    this.successRedirect = this.successRedirect.bind(this);

    this.refNodes = {};
  }

  componentDidMount() {
    this.refNodes.email.focus();

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
        password: this.refNodes.password.value,
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
      passwordCharacter: this.refNodes.password.value,
      passwordNumber: this.refNodes.password.value,
      passwordLength: this.refNodes.password.value,
      confirmPassword: this.refNodes.confirmPassword.value,
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

  assignRef(refName, innerRefName) {
    return (ref) => {
      if (!ref) {
        this.refNodes[refName] = null;
        return;
      }
      this.refNodes[refName] = innerRefName ? ref[innerRefName] : ref;
    };
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
        <div className="row error-message error-text text-center">
          <FormattedMessage {...COMMON_MESSAGES.operationFail} />
        </div>
      );
    }

    if (requestStatus === SUCCESS) {
      return (
        <div className="row color-success text-center">
          <FormattedMessage {...COMMON_MESSAGES.resetPasswordSuccess} />
        </div>
      );
    }

    return null;
  }

  renderValidatorIcon(isValid) {
    return isValid ?
      <Icon symbolName="tick" className="u-mr-" color="success" /> :
      <Icon symbolName="dash" className="u-mr- invalid-icon" />;
  }

  renderValidator() {
    const {
      showValidator,
      validation: { passwordCharacter, passwordNumber, passwordLength },
    } = this.state;
    if (!showValidator) {
      return null;
    }

    const classSets = bem('password-validator');
    return (
      <PointerBox className={classSets}>
        <div className={classSets('title').mix('row')}>
          <FormattedMessage id="passwordValidatorTitle" defaultMessage="Your password needs to:" />
        </div>
        <div className="row align-middle">
          {this.renderValidatorIcon(passwordCharacter)}
          <FormattedMessage id="passwordValidatorCharacter" defaultMessage="Include both upper and lower case characters" />
        </div>
        <div className="row align-middle">
          {this.renderValidatorIcon(passwordNumber)}
          <FormattedMessage id="passwordValidatorNumber" defaultMessage="Include at least one number or symbol" />
        </div>
        <div className="row align-middle">
          {this.renderValidatorIcon(passwordLength)}
          <FormattedMessage id="passwordValidatorLength" defaultMessage="Be at least 8 characters" />
        </div>
      </PointerBox>
    );
  }

  render() {
    const { intl: { formatMessage } } = this.props;
    const classSets = bem('auth-section');

    return (
      <div className={classSets}>
        <AppLogo />
        <div className={classSets('main-block').mix('callout callout--white')}>
          <h3 className={classSets('title')}>
            <FormattedMessage id="setNewPassword" defaultMessage="Set New Password" />
          </h3>
          <form onSubmit={this.onSubmit} >
            <div className="row field-row">
              <Field className="column" isUnderlined>
                <TextInput
                  isUnderlined
                  placeholder={formatMessage(COMMON_MESSAGES.email)}
                  ref={this.assignRef('email', 'inputRef')}
                  defaultValue={this.props.appMeta.id}
                  readOnly
                />
              </Field>
            </div>
            <div className="row field-row">
              {this.renderValidator()}
              <Field className="column" isUnderlined>
                <TextInput
                  isUnderlined
                  isPassword
                  placeholder={formatMessage(COMMON_MESSAGES.password)}
                  ref={this.assignRef('password', 'inputRef')}
                  defaultValue={this.state.password}
                  onChange={this.validateForm}
                  onFocus={this.handleFocus}
                  onBlur={this.handleBlur}
                />
              </Field>
            </div>
            <div className="row field-row">
              <Field className="column" isUnderlined>
                <TextInput
                  isUnderlined
                  isPassword
                  placeholder={formatMessage(COMMON_MESSAGES.confirmPassword)}
                  ref={this.assignRef('confirmPassword', 'inputRef')}
                  defaultValue={this.state.confirmPassword}
                  onChange={this.validateForm}
                />
              </Field>
            </div>
            {this.renderMessage()}
            <div className="row">
              <Button
                isExpanded
                type="submit"
                disabled={this.props.requestStatus === SUCCESS || !this.state.submitStatus}
              >
                <FormattedMessage id="confirm" defaultMessage="Confirm" />
              </Button>
            </div>
          </form>
        </div>
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
