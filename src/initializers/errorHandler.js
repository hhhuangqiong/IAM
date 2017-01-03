import logger from 'winston';
import { check } from 'm800-util';

import {
  ArgumentNullError,
  ArgumentError,
  ValidationError,
  AlreadyInUseError,
  NotFoundError,
  NotPermittedError,
  InvalidOperationError,
  NotSupportedError,
} from 'common-errors';

/**
 * To output the errorJSON object in the response
 * @method errorJSON
 * @param {Number} code the error code
 * @param {String} message the error message
 * @returns {Object} the error object
 */
function errorJSON(code, message) {
  return {
    error: {
      code,
      message,
    },
  };
}

export function errorHandler(imports) {
  check.members('import', imports, [
    'app',
    'logger',
  ]);
  const env = process.env.NODE_ENV || 'development';

  const server = imports.app;
  function handleErrors(err, req, res, next) {
    // show the error log when development or test
    if (env === 'development' || env === 'test') {
      logger.error(err);
    }
    switch (err.name) {
      case ArgumentNullError.name:
      case ArgumentError.name:
        switch (req.method) {
          case 'POST':
          case 'PUT':
            // Unprocessable Entity
            res.status(422)
               .json(errorJSON(20001, err.message));
            break;
          default:
            // Not found
            res.status(404)
               .json(errorJSON(20001, err.message));
            break;
        }
        break;
      case AlreadyInUseError.name:
        // conflict
        res.status(409)
           .json(errorJSON(20002, err.message));
        break;
      case ValidationError.name:
        // Unprocessable Entity
        res.status(422)
           .json(errorJSON(20003, err.message));
        break;
      case NotFoundError.name:
        // Not found
        res.status(404)
           .json(errorJSON(20001, err.message));
        break;
      case NotPermittedError.name:
        // 401 Not permit, throw unauthorized error
        // The request requires user authentication
        res.status(401)
           .json(errorJSON(20004, err.message));
        break;
      case InvalidOperationError.name:
        // 403 server understood the request, but is refusing to fulfill it.
        // Authorization will not help and the request SHOULD NOT be repeated
        res.status(403)
           .json(errorJSON(20005, err.message));
        break;
      case NotSupportedError.name:
        res.status(403)
           .json(errorJSON(20006, err.message));
        break;
      default:
        res.status(400)
         .json(errorJSON(20000, err.message));
        break;
    }
    next();
  }

  server.use(handleErrors);
}
