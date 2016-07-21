import isUndefined from 'lodash/isUndefined';
import { ArgumentNullError } from 'common-errors';
import Q from 'q';

import CompanyController from '../controllers/company';
import { expressError } from '../../../utils/errorHelper';
import { formatGetAllResult } from '../utils/helper';

const companyController = new CompanyController();

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

function updateOrInsert(company, req, res) {
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
  if (isUndefined(req.body.id) && isUndefined(req.params.id)) {
    expressError(new ArgumentNullError('id'), req, res);
    return;
  }
  if (isUndefined(req.body.country)) {
    expressError(new ArgumentNullError('country'), req, res);
    return;
  }
  next();
}

export function getAll(req, res) {
  const allParam = req.locals.input;
  const promiseArray = [];
  // get the resources
  promiseArray.push(companyController.getAll(allParam.query, {
    pageNo: allParam.pageNo,
    pageSize: allParam.pageSize,
  }, allParam.sort));

  // get the total count
  promiseArray.push(companyController.getTotal(allParam.query));

  // format the result data
  Q.all(promiseArray)
    .then(resultArray => {
      const [companies, count] = resultArray;
      const result = formatGetAllResult(allParam, count,
        companies.map((comp) => formatCompany(comp.toJSON(), req)));
      res.status(200).json(result);
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
  companyController.create(req.locals.input.data, req.locals.input.user)
    .then((company) => {
      res.status(201)
         .set('Location', getCompanyUrl(company.id, req))
         .json({ id: company.id });
    })
    .catch(err => expressError(err, req, res))
    .done();
}

export function patch(req, res) {
  companyController.patch(req.params.id, req.body, req.user)
    .then((user) => updateOrInsert(user, req, res))
    .catch(err => expressError(err, req, res))
    .done();
}

export function replace(req, res) {
  const param = req.locals.input.data;
  param.id = req.params.id;
  companyController.replace(req.params.id, param, req.locals.input.user)
    .then((company) => updateOrInsert(company, req, res))
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
