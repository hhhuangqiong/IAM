import expressValidator from 'express-validator';
import { ArgumentNullError } from 'common-errors';

import { expressError } from './errorHelper';

// format the error message from express validator
export function formatError(errors) {
  return errors.map(issue => `${issue.msg}`).join(', ');
}

// all the errors are null for keys, throw error in error Helper
export function errorResponse(errors, req, res) {
  return expressError(new ArgumentNullError(formatError(errors)), req, res);
}

export function injectExpressValidator(app) {
  app.use(expressValidator());
  return app;
}
