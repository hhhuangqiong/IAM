import { ValidationError } from 'common-errors';
import * as jsonpatch from 'fast-json-patch';
/**
 * To handle the json patch error
 * @method errorHandler
 * @param {Object} error the patch error from fast-json-patch
 * @throws {ValidationError} when the patch operation is not correct
 */
function errorHandler(error) {
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

export function jsonPatch(object, patches, validate = true) {
  try {
    jsonpatch.apply(object, patches, validate);
  } catch (ex) {
    throw errorHandler(ex);
  }
}

export default jsonPatch;
