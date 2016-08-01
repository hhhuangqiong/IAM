import multer from 'multer';
import { tmpdir } from 'os';
import { ArgumentError, ArgumentNullError } from 'common-errors';

const upload = multer({ dest: tmpdir() });

/**
 * middleware to handle file uploading
 * @method uploadFile
 * @param {String} expectedField the field to send along with the file
 * @param {Object} req the express request object
 * @param {Object} res the express response object
 * @param {Object} next the express next object
 * @throws {ArgumentError} invalid field for file uploading
 * @throws {ArgumentNullError} missing file
 * @returns {Object} multer upload handler
 */
export function uploadFile(expectedField, req, res, next) {
  const fileUpload = upload.single(expectedField);
  fileUpload(req, res, (err) => {
    if (err) {
      next(new ArgumentError(`${err.code} on field ${err.field}`));
      return;
    }
    // missing file
    if (!req.file) {
      next(new ArgumentNullError(expectedField));
      return;
    }
    next();
  });
  return fileUpload;
}

export default uploadFile;
