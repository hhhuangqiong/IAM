import fs from 'fs';
import mime from 'mime';
import Promise from 'bluebird';
import { NotFoundError, ArgumentNullError } from 'common-errors';
import { check } from 'm800-util';

export function createGridFsStorage(gridFs) {
  check.ok('gridFs', gridFs);
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
  function addFile(filePath, options) {
    check.ok('filePath', filePath);
    const writeStream = gridFs.createWriteStream({
      filename: options.filename || filePath.split('/').pop(),
      // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
      content_type: options.mimeType || mime.lookup(filePath),
    });
    fs.createReadStream(filePath).pipe(writeStream);
    return new Promise((resolve, reject) => {
      writeStream.on('close', gfsFile => {
        if (options.unlinkFile) {
          try {
            fs.unlinkSync(filePath);
          } catch (ex) {
            reject(ex);
          }
        }
        resolve(gfsFile);
      });
      writeStream.on('error', reject);
    });
  }

  /**
   * get the buffer by the file id
   * @method getFile
   * @param {String} id the file id
   * @returns {Promise<Buffer>} return the file
   */
  function getFile(id) {
    if (!id) {
      return Promise.reject(new ArgumentNullError(id));
    }

    // check the file if exist
    return gridFs.findOneAsync({ _id: id }).then(data => {
      // return error if no data
      if (!data) {
        throw new NotFoundError(id);
      }
      return new Promise((resolve, reject) => {
        // get the file from gridfs
        const readstream = gridFs.createReadStream({
          _id: id,
        });
        const bufs = [];
        readstream.on('data', chunk => {
          bufs.push(chunk);
        });
        readstream.on('end', () => {
          // convert to base64
          const fbuf = Buffer.concat(bufs);
          resolve({
            buffer: fbuf,
            meta: data,
          });
        });
        readstream.on('error', reject);
      });
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
  function removeFile(id) {
    if (!id) {
      return Promise.reject(new ArgumentNullError(id));
    }
    return gridFs.existAsync({ _id: id }).then((data) => {
      // return error if no data
      if (!data) {
        throw new NotFoundError(id);
      }
      return gridFs.removeAsync({
        _id: id,
      });
    });
  }

  return {
    addFile,
    getFile,
    removeFile,
  };
}

export default createGridFsStorage;
