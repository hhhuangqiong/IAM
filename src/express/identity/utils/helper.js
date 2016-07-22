import * as tv4 from 'tv4';
import multer from 'multer';
import { tmpdir } from 'os';
import pick from 'lodash/pick';

import {
  ArgumentError,
  ArgumentNullError,
  ValidationError,
} from 'common-errors';
import {
  DEFAULT_SORT_ORDER,
  DEFAULT_PAGE_NO,
  DEFAULT_COMPANY_SORT_BY,
  DEFAULT_USER_SORT_BY,
  DEFAULT_PAGE_SIZE,
} from '../constants/param';
import { expressError, schemaExpressError } from '../../../utils/errorHelper';

const upload = multer({ dest: tmpdir() });

/**
 * Get the sorting order, if it is incorrect, it will return the default sort order
 * @method getSortOrder
 * @param {String} sortOrder the sortOrder method either asc, desc, ascending, descending, 1, -1
 * @returns {String} the sortOrder type
 */
export function getSortOrder(sortOrder) {
  if (!!~['asc', 'desc', 'ascending', 'descending', 1, -1].indexOf(sortOrder)) {
    return sortOrder;
  }
  return DEFAULT_SORT_ORDER;
}

/**
 * When getting all the parameter, it will remove those unnecesssary filtering such as
 * pagination and sorting order.
 * @method updateFilter
 * @param {Object} param
 * @returns {Object} filtered parameter
 */
function updateFilter(param) {
  const myParam = {};
  Object.keys(param).forEach((key) => {
   // ignore the case for size and page sortBy param which are used for pagination
    if (!!~['size', 'page', 'sortBy', 'sortOrder'].indexOf(key)) {
      return;
    }
    const propertiesNameArray = key.split('.');
    let tempParam = myParam;
    propertiesNameArray.forEach((propertiesName, index) => {
      if (index === propertiesNameArray.length - 1) {
        tempParam[propertiesName] = param[key];
        return;
      }
      tempParam[propertiesName] = {};
      tempParam = tempParam[propertiesName];
    });
  });
  return myParam;
}

/**
 * Validate the input data whether fulfil the schema and format the data for the next handler
 * @method validateData
 * @param {Object} schema the tv4 schema to valiate the properties type
 * @param {Object} req the express request object
 * @param {Object} res the express response object
 * @param {Object} next the express next object
 * @throws {ValidationError} arguement doesn't fulfil the schema
 */
export function validateData(schema, req, res, next) {
  const data = req.body;
  // validate the data format and ban unknown properties
  const result = tv4.validateMultiple(data, schema, undefined, true);
  if (!result.valid) {
    schemaExpressError(result, req, res);
    return;
  }
  req.locals = req.locals || {};
  // append the data to local for the next handler
  /* eslint no-param-reassign: ["error", { "props": false }]*/
  req.locals.input = {
    user: data.userId,
    data,
  };
  next();
}

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
      expressError(new ArgumentError(`${err.code} on field ${err.field}`), req, res);
      return;
    }
    // missing file
    if (!req.file) {
      expressError(new ArgumentNullError(expectedField), req, res);
      return;
    }
    next();
  });
  return fileUpload;
}

/**
 * get all param update
 * @method updateGetAllParam
 * @param {Object} schema the tv4 schema to valiate the properties type
 * @param {Object} req the express request object
 * @param {Object} res the express response object
 * @param {Object} next the express next object
 */
export function updateGetAllParam(schema, req, res, next) {
  req.locals = req.locals || {};
  // convert the query to object
  const updatedFilter = updateFilter(req.query);

  // validate the query are existing in the schema
  const result = tv4.validateMultiple(updatedFilter, schema, undefined, true);
  if (!result.valid) {
    schemaExpressError(result, req, res);
    return;
  }
  // update the get all parameter

  req.locals.input = {
    pageNo: (req.query.page && parseInt(req.query.page, 10)) || DEFAULT_PAGE_NO,
    pageSize: (req.query.size && parseInt(req.query.size, 10)) || DEFAULT_PAGE_SIZE,
    query: updatedFilter,
    sort: {},
  };

  const sortBy = req.query.sortBy ||
    (schema.title === 'User' ? DEFAULT_USER_SORT_BY : DEFAULT_COMPANY_SORT_BY);

  req.locals.input.sort[sortBy] = getSortOrder(req.query.sortOrder);
  next();
}

/**
 * format the style for get all result
 * @method formatGetAllResult
 * @returns {Object} result the result object
 * @returns {Number} result.total the total number of the result
 * @returns {Number} result.page_size the number of item in a page
 * @returns {Number} result.page_no the page number
 * @returns {Resource[]} the resource array
 */
export function formatGetAllResult(allParam, count, resources) {
  return {
    total: count,
    page_size: allParam.pageSize,
    page_no: allParam.pageNo,
    resources,
  };
}

/**
 * Filter the parameter mentioned in the schema
 * @method filterProperties
 * @param {Object} param the parameter
 * @param {Object} schema the tv4 schema to valiate the properties type
 * @returns {Object} the filter properties
 */
export function filterProperties(param, schema) {
  const expectedProps = Object.keys(schema);
  // obtain the expected param and filter out useless field
  return pick(param, expectedProps);
}

/**
 * validate the patch format whether contain array
 * @method validatePatchFormat
 * @param {Object} req the express request object
 * @param {Object} res the express response object
 * @param {Object} next the express next object
 */
export function validatePatchFormat(req, res, next) {
  if (!Array.isArray(req.body)) {
    expressError(new ValidationError('Patch requests a set of changes in an array'), req, res);
    return;
  }
  next();
}
