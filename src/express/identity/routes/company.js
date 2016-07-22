import isUndefined from 'lodash/isUndefined';
import { ArgumentNullError } from 'common-errors';
import Q from 'q';

import CompanyController from '../controllers/company';
import { expressError } from '../../../utils/errorHelper';
import { formatGetAllResult } from '../utils/helper';

const companyController = new CompanyController();

/**
 * Obtain the logo url
 * @method getLogoUrl
 * @param {String} id the logo file id
 * @param {Object} req the express request object
 * @returns {String} the logo url
 */
function getLogoUrl(id, req) {
  return `${req.protocol}://${req.get('host')}/identity/companies/logo/${id}`;
}

/**
 * Obtain the company url
 * @method getCompanyUrl
 * @param {String} id the company id
 * @param {Object} req the express request object
 * @returns {String} the company url
 */
function getCompanyUrl(id, req) {
  return `${req.protocol}://${req.get('host')}/identity/companies/${id}`;
}

/**
 * format the output of company profile
 * @method formatCompany
 * @param {Object} company the company object
 * @param {Object} req the express request object
 * @returns {Object} the updated company object
 */
function formatCompany(company, req) {
  const targetCompany = company;
  if (company.logo) {
    targetCompany.logo = getLogoUrl(company.logo, req);
  }
  return targetCompany;
}

/**
 * Deteremine set the response status based on insert or update
 * @method updateOrInsert
 * @param {Object} user the userObject
 * @param {Object} req the express request object
 * @param {Object} res the express response object
 */
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

/**
 * validate the required field for company
 * @method validatedRequired
 * @param {Object} req the express request object
 * @param {Object} res the express response object
 * @param {Object} next the express next object
 * @throws {ArgumentNullError} Missing country or id
 */
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

/**
 * @method getAll
 * @param {Object} req the express request object
 * @param {Object} res the express response object
 */
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

/**
 * @method get
 * @param {Object} req the express request object
 * @param {Object} res the express response object
 */
export function get(req, res) {
  companyController.get(req.params.id)
    .then((company) => {
      res.status(200)
         .json(formatCompany(company.toJSON(), req));
    })
    .catch(err => expressError(err, req, res))
    .done();
}

/**
 * @method create
 * @param {Object} req the express request object
 * @param {Object} res the express response object
 */
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

/**
 * @method patch
 * @param {Object} req the express request object
 * @param {Object} res the express response object
 */
export function patch(req, res) {
  companyController.patch(req.params.id, req.body, req.user)
    .then((user) => updateOrInsert(user, req, res))
    .catch(err => expressError(err, req, res))
    .done();
}

/**
 * @method replace
 * @param {Object} req the express request object
 * @param {Object} res the express response object
 */
export function replace(req, res) {
  const param = req.locals.input.data;
  param.id = req.params.id;
  companyController.replace(req.params.id, param, req.locals.input.user)
    .then((company) => updateOrInsert(company, req, res))
    .catch(err => expressError(err, req, res))
    .done();
}

/**
 * @method remove
 * @param {Object} req the express request object
 * @param {Object} res the express response object
 */
export function remove(req, res) {
  companyController.remove(req.params.id)
    .then(() => res.status(204).end())
    .catch(err => expressError(err, req, res))
    .done();
}

/**
 * @method getLogo
 * @param {Object} req the express request object
 * @param {Object} res the express response object
 */
export function getLogo(req, res) {
  companyController.getLogo(req.params.id)
    .then(buffer => {
      res.end(buffer);
    })
    .catch(err => expressError(err, req, res))
    .done();
}

/**
 * @method createLogo
 * @param {Object} req the express request object
 * @param {Object} res the express response object
 */
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

/**
 * @method removeLogo
 * @param {Object} req the express request object
 * @param {Object} res the express response object
 */
export function removeLogo(req, res) {
  companyController.removeLogo(req.params.id)
    .then(() => res.status(204).end())
    .catch(err => expressError(err, req, res))
    .done();
}
