import React, { Component } from 'react';

class ResetPassword extends Component {
  render() {
    return (
      <form method="POST">
        <div className="panel--extra__title">
          <h1 className="text-center">
            Reset password
          </h1>
        </div>
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
        </div>
        <button
          id="sign-in-button"
          className="button--primary right"
        >
        Submit
        </button>
      </form>
    );
  }
}
export default ResetPassword;
