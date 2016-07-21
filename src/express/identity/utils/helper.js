import * as tv4 from 'tv4';
import multer from 'multer';
import { tmpdir } from 'os';

import { ArgumentError, ArgumentNullError } from 'common-errors';
import {
  DEFAULT_SORT_ORDER,
  DEFAULT_PAGE_NO,
  DEFAULT_COMPANY_SORT_BY,
  DEFAULT_USER_SORT_BY,
  DEFAULT_PAGE_SIZE,
} from '../constants/param';
import { expressError, schemaExpressError } from '../../../utils/errorHelper';

const upload = multer({ dest: tmpdir() });

export function getSortOrder(sortOrder) {
  if (!!~['asc', 'desc', 'ascending', 'descending', 1, -1].indexOf(sortOrder)) {
    return sortOrder;
  }
  return DEFAULT_SORT_ORDER;
}

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

export function formatGetAllResult(allParam, count, resources) {
  return {
    total: count,
    page_size: allParam.pageSize,
    page_no: allParam.pageNo,
    resources,
  };
}
