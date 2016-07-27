import _ from 'lodash';
import { NotFoundError } from 'common-errors';
import Joi from 'joi';

import { jsonPatch, mongoose as mongooseUtil, rename } from '../../../utils';
import {
  DEFAULT_PAGE_SIZE,
  DEFAULT_PAGE_NO,
  DEFAULT_COMPANY_SORT_BY,
  DEFAULT_SORT_ORDER,
} from '../../../constants/param';

export function companyService(validator, { Company }, logoService) {
  const baseCompany = Joi.object({
    parent: Joi.string(),
    name: Joi.string(),
    themeType: Joi.string(),
    reseller: Joi.boolean(),
    address: Joi.object({
      formatted: Joi.string(),
      streetAddress: Joi.string(),
      locality: Joi.string(),
      region: Joi.string(),
      postalCode: Joi.string(),
      country: Joi.string(),
    }),
    active: Joi.boolean(),
    timezone: Joi.string(),
    accountManager: Joi.string(),
    businessContact: Joi.array().items(Joi.object({
      name: Joi.string(),
      phone: Joi.string(),
      email: Joi.string().email(),
    })),
    technicalContact: Joi.array().items(Joi.object({
      name: Joi.string(),
      phone: Joi.string(),
      email: Joi.string().email(),
    })),
    supportContact: Joi.array().items(Joi.object({
      name: Joi.string(),
      phone: Joi.string(),
      email: Joi.string().email(),
    })),
  });

  function* validateParent(parent) {
    const company = yield Company.findOne({ _id: parent }).select('_id');
    if (!company) {
      throw new NotFoundError('parent');
    }
  }

  const createCompanyCommandSchema = baseCompany.keys({
    id: Joi.string().required(),
    country: Joi.string().required(),
  });

  function* createCompany(command) {
    const sanitizedCommand = validator.sanitize(command, createCompanyCommandSchema);
    // verify the parent company id
    if (sanitizedCommand.parent) {
      yield validateParent(sanitizedCommand.parent);
    }
    try {
      const company = yield Company.create(sanitizedCommand);
      return company.toJSON();
    } catch (e) {
      throw mongooseUtil.errorHandler(e);
    }
  }

  const getCompaniesCommandSchema = baseCompany.keys({
    id: Joi.string(),
    country: Joi.string(),
    createdAt: Joi.string(),
    updatedAt: Joi.string(),
    pageNo: Joi.number().positive().default(DEFAULT_PAGE_NO),
    pageSize: Joi.number().positive().default(DEFAULT_PAGE_SIZE),
    sortBy: Joi.string().default(DEFAULT_COMPANY_SORT_BY),
    sortOrder: Joi.string().valid('asc', 'desc').default(DEFAULT_SORT_ORDER),
  });

  function* getCompanies(command) {
    const sanitizedCommand = validator.sanitize(command, getCompaniesCommandSchema);
    let filters = _.omit(sanitizedCommand, ['sortBy', 'sortOrder', 'pageNo', 'pageSize']);
    // update the filter with the _id key
    filters = rename(filters, { id: '_id' });
    let sort = {};
    sort[sanitizedCommand.sortBy] = sanitizedCommand.sortOrder;
    // update the sortBy with the _id key
    sort = rename(sort, { id: '_id' });
    const companies = yield Company.find(filters)
      .skip(sanitizedCommand.pageNo * sanitizedCommand.pageSize)
      .limit(sanitizedCommand.pageSize)
      .sort(sort);
    const total = yield Company.find(filters).count();
    return {
      total,
      pageNo: sanitizedCommand.pageNo,
      pageSize: sanitizedCommand.pageSize,
      companies: companies.map((company) => company.toJSON()),
    };
  }

  const getCompanyCommandSchema = Joi.object({
    id: Joi.string().required(),
  });

  function* getCompany(command) {
    const sanitizedCommand = validator.sanitize(command, getCompanyCommandSchema);
    const company = yield Company.findOne({ _id: sanitizedCommand.id });
    if (!company) {
      throw new NotFoundError('company');
    }
    return company.toJSON();
  }

  const deleteCompanyCommandSchema = Joi.object({
    id: Joi.string().required(),
  });

  function* deleteCompany(command) {
    const sanitizedCommand = validator.sanitize(command, deleteCompanyCommandSchema);
    const company = yield Company.findOne({ _id: sanitizedCommand.id });
    if (!company) {
      throw new NotFoundError('company');
    }
    if (!company.logo) {
      yield company.remove();
      return;
    }

    yield logoService.remove(company.logo);
    yield company.remove();
  }

  const updateCompanyCommandSchema = baseCompany.keys({
    id: Joi.string().required(),
    country: Joi.string(),
  });

  function* setCompanyInfo(command) {
    const sanitizedCommand = validator.sanitize(command, updateCompanyCommandSchema);
    const company = yield Company.findOne({ _id: sanitizedCommand.id });
    // create a new company when fail to find existing one
    if (!company) {
      const newCompany = yield createCompany(sanitizedCommand);
      return newCompany;
    }
    // update the company info
    if (sanitizedCommand.parent) {
      yield validateParent(sanitizedCommand.parent);
    }
    // pull the internal and required properties
    const companyInfo = _.difference(_.keys(company.toJSON()),
      ['createdAt', 'updatedAt', 'createdBy', 'updatedBy', 'reseller']);
    const additional = _.difference(companyInfo, _.keys(sanitizedCommand));
    // remove extra keys that aren't set
    _(additional).each(key => _.set(company, key, undefined));
    // update the data
    _(sanitizedCommand).omit('id').each((value, key) => _.set(company, key, value));
    yield company.save();
    return null;
  }

  const patchCompanyCommandSchema = Joi.object({
    id: Joi.string().required(),
    patches: Joi.array().items(),
  });

  function* patchCompanyInfo(command) {
    let sanitizedCommand = validator.sanitize(command, patchCompanyCommandSchema);
    const company = yield Company.findOne({ _id: sanitizedCommand.id });
    let currentCompany;
    // default company will contain id
    if (!company) {
      currentCompany = {
        id: sanitizedCommand.id,
      };
    } else {
      currentCompany = _.omit(company.toJSON(),
       ['createdAt', 'updatedAt', 'createdBy', 'updatedBy']);
    }

    // apply patches to the company
    jsonPatch(currentCompany, sanitizedCommand.patches);

    // create a new company when fail to find existing one
    if (!company) {
      const newCompany = yield createCompany(currentCompany);
      return newCompany;
    }

    // validate the change after the json patches
    sanitizedCommand = validator.sanitize(currentCompany, updateCompanyCommandSchema);
    // update the values when patch successfully
    _(sanitizedCommand).omit('id')
      .each((value, key) => _.set(company, key, value));
    yield company.save();
    return null;
  }

  return {
    createCompany,
    getCompanies,
    getCompany,
    deleteCompany,
    setCompanyInfo,
    patchCompanyInfo,
  };
}
