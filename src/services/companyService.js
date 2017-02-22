import _ from 'lodash';
import { NotFoundError, ValidationError } from 'common-errors';
import Joi from 'joi';

import { mongoose as mongooseUtil, rename, validator } from './util';
import {
  DEFAULT_PAGE_SIZE,
  DEFAULT_PAGE_NO,
  DEFAULT_COMPANY_SORT_BY,
  DEFAULT_SORT_ORDER,
} from './constants';

const idRegExp = /^[0-9a-fA-F]{24}$/;
export function companyService(Company, logoService) {
  // helper function to throw notFound Error when can't find any company from database
  async function findOneCompany(id) {
    const company = await Company.findOne({ _id: id });
    if (!company) {
      throw new NotFoundError('company');
    }
    return company;
  }

  const baseCompany = Joi.object({
    parent: Joi.string().regex(idRegExp),
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

  async function validateParent(parent) {
    const company = await Company.findOne({ _id: parent }).select('_id');
    if (!company) {
      throw new NotFoundError('parent');
    }
  }

  const createCompanyCommandSchema = baseCompany.keys({
    country: Joi.string().length(2).required(),
  });

  async function createCompany(command) {
    const sanitizedCommand = validator.sanitize(command, createCompanyCommandSchema);
    // verify the parent company id
    if (sanitizedCommand.parent) {
      await validateParent(sanitizedCommand.parent);
    }
    try {
      const company = await Company.create(sanitizedCommand);
      return company.toJSON();
    } catch (e) {
      throw mongooseUtil.errorHandler(e);
    }
  }

  const getCompaniesCommandSchema = baseCompany.keys({
    id: Joi.string().regex(idRegExp),
    name: Joi.string(),
    country: Joi.string(),
    parent: Joi.string().regex(idRegExp),
    page: Joi.number().positive().default(DEFAULT_PAGE_NO),
    pageSize: Joi.number().positive().default(DEFAULT_PAGE_SIZE),
    sortBy: Joi.string().default(DEFAULT_COMPANY_SORT_BY),
    sortOrder: Joi.string().valid('asc', 'desc').default(DEFAULT_SORT_ORDER),
    search: Joi.string(),
    ids: Joi.string(),
  }).without('id', 'ids') // id, ids can't exist together
  .without('name', 'search'); // name and search can't exist together

  async function getCompanies(command) {
    const sanitizedCommand = validator.sanitize(command, getCompaniesCommandSchema);
    let filters = _.omit(sanitizedCommand, ['sortBy', 'sortOrder', 'page', 'pageSize']);
    // search will perform search by name
    // perform search by id contain the filter param which similar to SQL like
    if (filters.search) {
      try {
        filters.name = new RegExp(`.*${filters.search}.*`, 'i');
        delete filters.search;
      } catch (ex) {
        throw new ValidationError('invalid search');
      }
    }
    if (filters.ids) {
      filters.id = {
        $in: filters.ids.split(','),
      };
      delete filters.ids;
    }
    // update the filter with the _id key
    filters = rename(filters, { id: '_id' });
    let sort = {};
    sort[sanitizedCommand.sortBy] = sanitizedCommand.sortOrder;
    // update the sortBy with the _id key
    sort = rename(sort, { id: '_id' });
    const companies = await Company.find(filters)
      .skip((sanitizedCommand.page - 1) * sanitizedCommand.pageSize)
      .limit(sanitizedCommand.pageSize)
      .sort(sort);
    const total = await Company.find(filters).count();
    return {
      total,
      pageTotal: Math.ceil(total / sanitizedCommand.pageSize),
      page: sanitizedCommand.page,
      pageSize: sanitizedCommand.pageSize,
      items: companies.map(company => company.toJSON()),
    };
  }

  const getCompanyCommandSchema = Joi.object({
    id: Joi.string().regex(idRegExp).required(),
  });

  async function getCompany(command) {
    const sanitizedCommand = validator.sanitize(command, getCompanyCommandSchema);
    const company = await findOneCompany(sanitizedCommand.id);
    return company.toJSON();
  }

  const deleteCompanyCommandSchema = Joi.object({
    id: Joi.string().regex(idRegExp).required(),
  });

  async function deleteCompany(command) {
    const sanitizedCommand = validator.sanitize(command, deleteCompanyCommandSchema);
    const company = await findOneCompany(sanitizedCommand.id);
    if (!company.logo) {
      await company.remove();
      return;
    }

    await logoService.remove(company.logo);
    await company.remove();
  }

  const updateCompanyCommandSchema = baseCompany.keys({
    id: Joi.string().regex(idRegExp).required(),
    country: Joi.string().length(2),
  });

  async function setCompanyInfo(command) {
    const sanitizedCommand = validator.sanitize(command, updateCompanyCommandSchema);
    if (sanitizedCommand.parent) {
      await validateParent(sanitizedCommand.parent);
    }
    const company = await Company.findOneAndUpdate({ _id: sanitizedCommand.id },
      _.omit(sanitizedCommand, 'id'), { new: true, upsert: true });
    return company.toJSON();
  }

  const getDescendantsCommandSchema = Joi.object({
    id: Joi.string().regex(idRegExp).required(),
  });

  async function getDescendants(companyId, descendants) {
    const companies = await Company.find({ parent: companyId });
    for (const company of companies) {
      descendants.push(company.toJSON());
      await getDescendants(company._id, descendants);
    }
  }

  async function getDescendantCompanies(command) {
    const sanitizedCommand = validator.sanitize(command, getDescendantsCommandSchema);
    const descendants = [];
    await getDescendants(sanitizedCommand.id, descendants);
    return descendants;
  }

  return {
    createCompany,
    getCompanies,
    getCompany,
    getDescendantCompanies,
    deleteCompany,
    setCompanyInfo,
  };
}

export default companyService;
