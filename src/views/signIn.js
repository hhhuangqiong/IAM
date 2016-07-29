import React, { PropTypes, Component } from 'react';

class SignIn extends Component {
  render() {
    return (
      <form method="POST" action="/openid/login">
        <div className="panel--extra__title">
          <h1 className="text-center">
            Sign-in
          </h1>
        </div>
        <input type="hidden" name="grant" value={this.props.grant} />
        <div className="panel--extra__body">
          <div className="row">
            <div className="large-24 columns">
              <div className="field-set--validation">
                <input
                  ref={ref => { this.usernameRef = ref; }}
                  className="radius"
                  type="text"
                  name="id"
                  placeholder="email"
                  autoComplete="off"
                  autoFocus
                />
              </div>
            </div>
          </div>
          <div className="row">
            <div className="large-24 columns">
              <div className="field-set--validation">
                <input
                  ref={ref => { this.passwordRef = ref; }}
                  autoComplete="off"
                  className="radius"
                  type="password"
                  name="password"
                  placeholder="password"
                />
              </div>
            </div>
          </div>
          <div className="row"><br />
            <input type="checkbox" name="remember" value="yes" checked="yes" />Remember Me</div>
          <div className="row">
            <div className="large-16 columns">
              {/*
                * Disable Forgot Password temporary until Account module is being used
              <label className="secondary">
                <Link to="forgot-password">
                  Forgot password?
                </Link>
              </label>
              */}
            </div>
            <div className="large-8 columns">
              <button
                id="sign-in-button"
                className="button--primary right"
              >
              Sign In
              </button>
            </div>
          </div>
        </div>
      </form>
    );
  }
}
SignIn.propTypes = {
  grant: PropTypes.string,
};
export default SignIn;
