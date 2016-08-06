import React, { Component } from 'react';

class SetPassword extends Component {
  render() {
    return (
      <form method="POST">
        <div className="panel--extra__title">
          <h1 className="text-center">
            Set your password
          </h1>
        </div>
        <div className="panel--extra__body">
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
          <button
            id="sign-in-button"
            className="button--primary right"
          >
          Submit
          </button>
        </div>
      </form>
    );
  }
}
export default SetPassword;
