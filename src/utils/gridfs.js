import fs from 'fs';
import mongoose from 'mongoose';
import Grid from 'gridfs-stream';
import mime from 'mime';
import Q from 'q';
import { NotFoundError, ArgumentNullError } from 'common-errors';

let gridFs;
export function initGridFs() {
  if (gridFs) {
    return;
  }
  const db = mongoose.connection.db;
  const mongoDriver = mongoose.mongo;
  gridFs = new Grid(db, mongoDriver);
}

/**
 * addFile
 * add file into gridFS from path of source
 *
 * @param {String} filePath - Path of file to be uploaded
 * @param {Object} options
 * @param {String} [options.filename] - Custom file name
 * @param {String} [options.mimeType] - mimeType
 * @param {Boolean} [options.unlinkFile] -
 *   Set true if you want to remove the file source, happens mostly in uploading
 * file
 * @param {Function} cb
 * @returns {*} - Returns GridFs document
 */
export function addFile(filePath, options) {
  this.initGridFs();
  if (!filePath) {
    return Q.reject(new ArgumentNullError(filePath));
  }
  const deferred = Q.defer();
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

export function getById(id) {
  this.initGridFs();
  if (!id) {
    return Q.reject(new ArgumentNullError(id));
  }
  // check the file if exist
  return Q.ninvoke(gridFs, 'exist', { _id: id }).then((data) => {
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
      deferred.resolve(fbuf);
    });
    readstream.on('error', deferred.reject);
    return deferred.promise;
  });
}

export function removeFile(id) {
  this.initGridFs();
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
