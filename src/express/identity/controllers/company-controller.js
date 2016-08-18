import _ from 'lodash';
import wrap from 'co-express';
import { Router } from 'express';

import { uploadFile } from '../../../utils';

export function companyController(companyService, logoService) {
  const router = new Router();

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

  function* postCompany(req, res, next) {
    try {
      const company = yield companyService.createCompany(req.body);
      res.status(201);
      res.set('Location', getCompanyUrl(company.id, req));
      res.json({ id: company.id });
    } catch (e) {
      next(e);
    }
  }

  function* getCompanies(req, res, next) {
    try {
      const { total, pageTotal, pageSize, page, companies } = yield companyService.getCompanies(req.query);
      const result = {
        total,
        pageTotal,
        pageSize,
        page,
        items: companies.map((comp) => formatCompany(comp, req)),
      };
      res.status(200);
      res.json(result);
    } catch (e) {
      next(e);
    }
  }

  function* getCompany(req, res, next) {
    try {
      const query = _.extend({}, req.params, req.query);
      const company = yield companyService.getCompany(query);
      res.status(200);
      res.json(formatCompany(company, req));
    } catch (e) {
      next(e);
    }
  }

  function* deleteCompany(req, res, next) {
    try {
      yield companyService.deleteCompany(req.params);
      res.sendStatus(204);
    } catch (e) {
      next(e);
    }
  }

  function* putCompany(req, res, next) {
    try {
      const command = _.extend({}, req.body, req.params);
      const company = yield companyService.setCompanyInfo(command);
      // update information will return 204
      if (!company) {
        res.sendStatus(204);
        return;
      }
      // create a new company
      res.status(201);
      res.set('Location', getCompanyUrl(company.id, req));
      res.json({ id: company.id });
    } catch (e) {
      next(e);
    }
  }

  function* patchCompany(req, res, next) {
    try {
      const command = {
        id: req.params.id,
        patches: req.body,
      };
      const company = yield companyService.patchCompanyInfo(command);
      // update information will return 204
      if (!company) {
        res.sendStatus(204);
        return;
      }
      // create a new company
      res.status(201);
      res.set('Location', getCompanyUrl(company.id, req));
      res.json({ id: company.id });
    } catch (e) {
      next(e);
    }
  }

  function* postLogo(req, res, next) {
    try {
      const command = {
        id: req.params.id,
        logo: req.file,
      };
      const logoId = yield logoService.createLogo(command);
      res.status(201);
      res.set('Location', getLogoUrl(logoId, req));
      res.json({ id: logoId });
    } catch (e) {
      next(e);
    }
  }

  function* deleteLogo(req, res, next) {
    try {
      yield logoService.deleteLogo(req.params);
      res.sendStatus(204);
    } catch (e) {
      next(e);
    }
  }

  function* getLogo(req, res, next) {
    try {
      const buffer = yield logoService.getLogo(req.params);
      res.end(buffer);
    } catch (e) {
      next(e);
    }
  }

  router.post('/companies', wrap(postCompany));
  router.get('/companies', wrap(getCompanies));
  router.get('/companies/:id', wrap(getCompany));
  router.delete('/companies/:id', wrap(deleteCompany));
  router.put('/companies/:id', wrap(putCompany));
  router.patch('/companies/:id', wrap(patchCompany));
  router.post('/companies/:id/logo', _.bind(uploadFile, null, 'logo'), wrap(postLogo));
  router.get('/companies/logo/:id', wrap(getLogo));
  router.delete('/companies/:id/logo', wrap(deleteLogo));

  return router;
}
