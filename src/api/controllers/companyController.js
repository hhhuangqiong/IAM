import _ from 'lodash';
import { check } from 'm800-util';

import { decorateController } from './controllerUtil';

export function companyController(companyService, logoService) {
  check.ok('companyService', companyService);
  check.ok('logoService', logoService);

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

  async function postCompany(req, res) {
    const company = await companyService.createCompany(req.body);
    res.status(201);
    res.set('Location', getCompanyUrl(company.id, req));
    res.json({ id: company.id });
  }

  async function getCompanies(req, res) {
    const companiesPage = await companyService.getCompanies(req.query);
    companiesPage.items = companiesPage.items.map(comp => formatCompany(comp, req));
    res.status(200);
    res.json(companiesPage);
  }

  async function getCompany(req, res) {
    const query = _.extend({}, req.params, req.query);
    const company = await companyService.getCompany(query);
    res.status(200);
    res.json(formatCompany(company, req));
  }

  async function getDescendantCompanies(req, res) {
    const companies = await companyService.getDescendantCompanies(req.params);
    res.status(200);
    res.json(companies.map(comp => formatCompany(comp, req)));
  }

  async function deleteCompany(req, res) {
    await companyService.deleteCompany(req.params);
    res.sendStatus(204);
  }

  async function putCompany(req, res) {
    const command = _.extend({}, req.body, req.params);
    const company = await companyService.setCompanyInfo(command);
    res.json(formatCompany(company, req));
  }

  async function postLogo(req, res) {
    // check for the logo file
    check.ok('file', req.file);
    const command = {
      id: req.params.id,
      logo: req.file,
    };
    const logoId = await logoService.createLogo(command);
    res.status(201);
    res.set('Location', getLogoUrl(logoId, req));
    res.json({ id: logoId });
  }

  async function deleteLogo(req, res) {
    await logoService.deleteLogo(req.params);
    res.sendStatus(204);
  }

  async function getLogo(req, res) {
    const imageObject = await logoService.getLogo(req.params);
    const contentType = _.get(imageObject, 'meta.contentType');
    if (contentType) {
      res.set('Content-Type', contentType);
    }
    res.end(imageObject.buffer);
  }

  return decorateController({
    postCompany,
    getCompanies,
    getCompany,
    getDescendantCompanies,
    deleteCompany,
    putCompany,
    getLogo,
    deleteLogo,
    postLogo,
  });
}

export default companyController;
