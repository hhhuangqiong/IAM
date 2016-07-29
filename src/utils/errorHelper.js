import {
  ArgumentNullError,
  ArgumentError,
  ValidationError,
  AlreadyInUseError,
  NotFoundError,
} from 'common-errors';

/**
 * To output the errorJSON object in the response
 * @method errorJSON
 * @param {Number} code the error code
 * @param {Number} status the error status
 * @param {String} message the error message
 * @returns {Object} the error object
 */
function errorJSON(code, status, message) {
  return {
    result: {
      code,
      status,
      message,
    },
  };
}

/**
 * To output the validation schema error message
 * @method formatSchemaMessage
 * @param {Object} error the schema error
 * @returns {String} the error message
 */
function formatSchemaMessage(errors) {
  let message = '';
  Object.keys(errors).forEach((key) => {
    const errorObject = errors[key];
    message = `${errorObject.dataPath} with ${errorObject.message} `;
  });
  return message;
}

/**
 * To handle the mongoose error
 * @method mongooseError
 * @param {Object} error the schema error
 * @throws {ValidationError} when the data is not in valid format
 * @throws {AlreadyInUseError} when the data is already inserted
 */
export function mongooseError(error) {
  // invalid schema for json when create
  if (error.name === 'ValidationError') {
    throw new ValidationError(`invalid data ${Object.keys(error.errors)} `, error);
  }

  switch (error.code) {
    case 11000:
      // extract the key from the error message
      throw new AlreadyInUseError(error.errmsg.match(/dup key: { : "(.+)" }/)[1]);
    default:
      break;
  }
}

/**
 * To handle the json patch error
 * @method jsonPatchError
 * @param {Object} error the patch error from fast-json-patch
 * @throws {ValidationError} when the patch operation is not correct
 */
export function jsonPatchError(error) {
  let message = 'invalid patch operation';
  if (error) {
    if (error.index > -1) {
      message = `Invalid operation number ${error.index}: `;
    }
    if (error.message) {
      message += error.message;
    }
  }
  throw new ValidationError(message);
}

/**
 * To handle all the express error and response with different error obeject
 * with status, error code and message
 * @method expressError
 * @param {Object} error the errorObject
 * @param {Object} req the express req object
 * @param {Object} res the express res object
 */
export function expressError(error, req, res) {
  switch (error.name) {
    case ArgumentNullError.name:
    case ArgumentError.name:
      switch (req.method) {
        case 'POST':
        case 'PUT':
          // Unprocessable Entity
          res.status(422)
             .json(errorJSON(20001, 422, error.message));
          break;
        default:
          // Not found
          res.status(404)
             .json(errorJSON(20001, 404, error.message));
          break;
      }
      break;
    case AlreadyInUseError.name:
      // conflict
      res.status(409)
         .json(errorJSON(20002, 409, error.message));
      break;
    case ValidationError.name:
      // Unprocessable Entity
      res.status(422)
         .json(errorJSON(20003, 422, error.message));
      break;
    case NotFoundError.name:
      // Not found
      res.status(404)
         .json(errorJSON(20001, 404, error.message));
      break;
    default:
      res.status(400)
       .json(errorJSON(20000, 400, error.message));
      break;
  }
}

/**
 * To handle tv4 schema valiation express error
 * @method schemaExpressError
 * @param {Object} result the result from the tv4 validation
 * @param {Object} req the express req object
 * @param {Object} res the express res object
 */
export function schemaExpressError(result, req, res) {
  const message = formatSchemaMessage(result.errors);
  expressError(new ValidationError(message), req, res);
}

/**
 * To get the error based on the tv4 schema
 * @method getSchemaError
 * @param {Object} result the result from the tv4 validation
 * @returns {Error} the validation error object
 */
export function getSchemaError(result) {
  const message = formatSchemaMessage(result.errors);
  return new ValidationError(message);
}
