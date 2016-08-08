import { ValidationError, AlreadyInUseError } from 'common-errors';
/**
 * Override the mongoose ToJSON, it will show the virtuals field and transform the model
 * into expected JSON object format. It will hide the empty array, hide the _id key and __v
 * where _id is duplicated with id and __v is a internal mongo key for the version
 * @method toJSON
 */
export const toJSON = {
  virtuals: true,
  transform: (doc, ret) => {
    /* eslint no-param-reassign: ["error", { "props": false }]*/
    // delete empty arrays, key _id which is duplicated with id
    Object.keys(ret).forEach(key => {
      // delete _id as it is diplayed in form of id.
      if (Array.isArray(ret[key]) && !ret[key].length || ['_id', 'tokens', 'hashedPassword', 'salt'].indexOf(key) > -1) {
        delete ret[key];
      }
    });
  },
};

/**
 * To handle the mongoose error
 * @method errorHandler
 * @param {Object} error the schema error
 * @throws {ValidationError} when the data is not in valid format
 * @throws {AlreadyInUseError} when the data is already inserted
 */
export function errorHandler(error) {
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

export const mongoose = {
  toJSON,
  errorHandler,
};

export default mongoose;
