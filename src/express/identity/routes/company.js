import _ from 'lodash';
import * as tv4 from 'tv4';
import { ArgumentNullError } from 'common-errors';

import CompanyController from '../controllers/company';
import { expressError, schemaExpressError } from '../../../utils/errorHelper';
import companyFormat from '../../../validationSchema/company.json';

export const DEFAULT_PAGE_SIZE = 20;
export const DEFAULT_PAGE_NO = 0;
export const DEFAULT_SORT_BY = 'id';
export const DEFAULT_SORT_ORDER = 'asc';

const companyController = new CompanyController();

function filterParams(param) {
  const expectedProps = Object.keys(companyFormat.properties);
  // obtain the expected param and filter out useless field
  return _.pick(param, expectedProps);
}

function getLogoUrl(id, req) {
  return `${req.protocol}://${req.get('host')}/identity/companies/logo/${id}`;
}

function getCompanyUrl(id, req) {
  return `${req.protocol}://${req.get('host')}/identity/companies/${id}`;
}

function formatCompany(company, req) {
  const targetCompany = company;
  if (company.logo) {
    targetCompany.logo = getLogoUrl(company.logo, req);
  }
  return targetCompany;
}

function getSortOrder(sortOrder) {
  if (!!~['asc', 'desc', 'ascending', 'descending', 1, -1].indexOf(sortOrder)) {
    return sortOrder;
  }
  return DEFAULT_SORT_ORDER;
}

function updateOrInsertCompany(company, req, res) {
  // updated the data
  if (!company) {
    res.status(204).end();
    return;
  }
  // create new company
  res.status(201)
     .set('Location', getCompanyUrl(company.id, req))
     .json({ id: company.id });
}

export function validateRequired(req, res, next) {
  // missing id in company
  if (_.isUndefined(req.body.id) && _.isUndefined(req.params.id)) {
    expressError(new ArgumentNullError('id'), req, res);
    return;
  }
  if (_.isUndefined(req.body.country)) {
    expressError(new ArgumentNullError('country'), req, res);
    return;
  }
  next();
}

export function validateData(req, res, next) {
  const data = filterParams(req.body);

  // validate the data format
  const result = tv4.validateMultiple(data, companyFormat);
  if (!result.valid) {
    schemaExpressError(result, req, res);
    return;
  }
  // append the data to local for the next handler
  /* eslint no-param-reassign: ["error", { "props": false }]*/
  req.local = {
    // @TODO mock userId
    user: '5785bb4d121a6a6f2227d8c1',
    company: data,
  };
  next();
}

export function getAll(req, res) {
  const pageNo = (req.query.page && parseInt(req.query.page, 10)) || DEFAULT_PAGE_NO;
  const pageSize = (req.query.size && parseInt(req.query.size, 10)) || DEFAULT_PAGE_SIZE;
  const sort = {};
  sort[req.query.sortBy || DEFAULT_SORT_BY] = getSortOrder(req.query.sortOrder);
  const query = filterParams(req.query);

  companyController.getAll(query, pageNo, pageSize, sort)
    .then(companies => {
      companyController.getTotal(query)
        .then(count => {
          const result = {
            total: count,
            page_size: pageSize,
            page_no: pageNo,
            resources: companies.map((comp) => formatCompany(comp.toJSON(), req)),
          };
          res.status(200).json(result);
        });
    })
    .catch(err => expressError(err, req, res))
    .done();
}

export function get(req, res) {
  companyController.get(req.params.id)
    .then((company) => {
      res.status(200)
         .json(formatCompany(company.toJSON(), req));
    })
    .catch(err => expressError(err, req, res))
    .done();
}

export function create(req, res) {
  companyController.create(req.local.company, req.local.user, req.file)
    .then((company) => {
      res.status(201)
         .set('Location', getCompanyUrl(company.id, req))
         .json({ id: company.id });
    })
    .catch(err => expressError(err, req, res))
    .done();
}

export function update(req, res) {
  // ensure the id should be the same
  const param = req.local.company;
  param.id = req.params.id;
  companyController.update(req.params.id, param, req.local.user)
    .then((company) => updateOrInsertCompany(company, req, res))
    .catch(err => expressError(err, req, res))
    .done();
}

export function replace(req, res) {
  const param = req.local.company;
  param.id = req.params.id;
  companyController.replace(req.params.id, param, req.local.user)
    .then((company) => updateOrInsertCompany(company, req, res))
    .catch(err => expressError(err, req, res))
    .done();
}

export function remove(req, res) {
  companyController.remove(req.params.id)
    .then(() => res.status(204).end())
    .catch(err => expressError(err, req, res))
    .done();
}

export function getLogo(req, res) {
  companyController.getLogo(req.params.id)
    .then(buffer => {
      res.end(buffer);
    })
    .catch(err => expressError(err, req, res))
    .done();
}

export function createLogo(req, res) {
  companyController.createLogo(req.file, req.params.id)
    .then(logoId => {
      res.status(201)
         .set('Location', getLogoUrl(logoId, req))
         .json({ id: logoId });
    })
    .catch(err => expressError(err, req, res))
    .done();
}

export function removeLogo(req, res) {
  companyController.removeLogo(req.params.id)
    .then(() => res.status(204).end())
    .catch(err => expressError(err, req, res))
    .done();
}
