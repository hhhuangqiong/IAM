import {
  ArgumentNullError,
  ArgumentError,
  ValidationError,
  AlreadyInUseError,
  NotFoundError,
} from 'common-errors';

function errorJSON(code, status, message) {
  return {
    result: {
      code,
      status,
      message,
    },
  };
}

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
       .json(errorJSON(20000, 400, error.meesage));
      break;
  }
}

export function schemaExpressError(result, req, res) {
  let message = '';

  Object.keys(result.errors).forEach((key) => {
    const errorObject = result.errors[key];
    message = `${errorObject.dataPath} with ${errorObject.message} `;
  });

  expressError(new ValidationError(message), req, res);
}

export function filterExpressError(key, req, res) {
  expressError(new ValidationError(`${key} is unavailable filter param`), req, res);
}
