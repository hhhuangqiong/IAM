import fs from 'fs';
import mime from 'mime';
import Q from 'q';
import { NotFoundError, ArgumentNullError } from 'common-errors';

import { getContainer } from './ioc';

/**
 * add file into gridFS from path of source
 * @method addFile
 * @param {String} filePath Path of file to be uploaded
 * @param {Object} options
 * @param {String} [options.filename] Custom file name
 * @param {String} [options.mimeType] mimeType
 * @param {Boolean} [options.unlinkFile] True if remove the file source
 * @returns {Promise<Object>} Returns GridFs document
 */
export function addFile(filePath, options) {
  if (!filePath) {
    return Q.reject(new ArgumentNullError(filePath));
  }
  const deferred = Q.defer();
  const { gridFs } = getContainer();
  const writeStream = gridFs.createWriteStream({
    filename: options.filename || filePath.split('/').pop(),
    // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
    content_type: options.mimeType || mime.lookup(filePath),
  });
  fs.createReadStream(filePath).pipe(writeStream);
  writeStream.on('close', (gfsFile) => {
    if (options.unlinkFile) {
      Q.ninvoke(fs, 'unlink', filePath)
        .then(() => deferred.resolve(gfsFile))
        .catch(deferred.reject);
      return;
    }
    deferred.resolve(gfsFile);
  });
  writeStream.on('error', deferred.reject);
  return deferred.promise;
}

/**
 * get the buffer by the file id
 * @method getFile
 * @param {String} id the file id
 * @returns {Promise<Buffer>} return the file
 */
export function getFile(id) {
  const { gridFs } = getContainer();
  if (!id) {
    return Q.reject(new ArgumentNullError(id));
  }
  // check the file if exist
  return Q.ninvoke(gridFs, 'findOne', { _id: id }).then((data) => {
    // return error if no data
    if (!data) {
      throw new NotFoundError(id);
    }
    const deferred = Q.defer();
    // get the file from gridfs
    const readstream = gridFs.createReadStream({
      _id: id,
    });
    const bufs = [];
    readstream.on('data', (chunk) => {
      bufs.push(chunk);
    });
    readstream.on('end', () => {
      // convert to base64
      const fbuf = Buffer.concat(bufs);
      deferred.resolve({
        buffer: fbuf,
        meta: data,
      });
    });
    readstream.on('error', deferred.reject);
    return deferred.promise;
  });
}

/**
 * remove the file from grid fs
 * @method removeFile
 * @param {String} id the file id
 * @returns {Promise<>} when succeed to remove file
 * @throws {NotFoundError} File can't be found
 * @throws {ArgumentNullError} missing the file id
 */
export function removeFile(id) {
  const { gridFs } = getContainer();
  if (!id) {
    return Q.reject(new ArgumentNullError(id));
  }
  return Q.ninvoke(gridFs, 'exist', { _id: id }).then((data) => {
    // return error if no data
    if (!data) {
      throw new NotFoundError(id);
    }
    return Q.ninvoke(gridFs, 'remove', {
      _id: id,
    });
  });
}

export default {
  addFile,
  getFile,
  removeFile,
};
