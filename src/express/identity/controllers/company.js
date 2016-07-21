import { ArgumentError, NotFoundError } from 'common-errors';
import Q from 'q';
import tv4 from 'tv4';
import * as jsonpatch from 'fast-json-patch';
import fs from 'fs';

import Company from '../../../collections/company';
import { filterProperties } from '../utils/helper';
import companyValidationSchema from '../../../validationSchema/company.json';
import { mongooseError,
   getSchemaError,
   jsonPatchError,
} from '../../../utils/errorHelper';

// populate the query with user details and parent id
function doPopulateData(query) {
  return query.populate('parent', 'id -_id')
         .populate('createdBy', 'username -_id')
         .populate('updatedBy', 'username -_id');
}

// get the company from the mongoose
function getCompany(id, option, populateData) {
  const query = Company.findOne({ id }, option);
  if (populateData) {
    doPopulateData(query);
  }
  return query.then(company => {
    if (!company) {
      throw new ArgumentError(`company id ${id} is not found`);
    }
    return company;
  });
}

// convert the company id to object id
function convertIdToObjectId(id) {
    /* eslint no-underscore-dangle: ["error", { "allow": ["company", "_id"] }]*/
  return getCompany(id).then(company => company._id);
}

// create a new company
function createCompany(param) {
  if (param.updatedBy) {
    param.createdBy = param.updatedBy;
  }
  return Company.create(param).catch(mongooseError);
}

function updateParam(param, userId) {
  const mParam = param;
  if (userId) {
    mParam.updatedBy = userId;
  }
  if (mParam.parent) {
    // convert the parent id into mongo _id
    return convertIdToObjectId(mParam.parent).then((id) => {
      mParam.parent = id;
      return mParam;
    });
  }

  return Q.resolve(mParam);
}

function toSchemaFormat(companyJSON) {
  const userFilteredProperties = filterProperties(companyJSON, companyValidationSchema.properties);
  return userFilteredProperties;
}

function applyPatch(company, patches, userId) {
  // apply the patches on the possible properies in schema
  try {
    jsonpatch.apply(company, patches, true);
  } catch (ex) {
    throw jsonPatchError(ex);
  }

  // undergo validation to see if any unexpected format or changes
  const result = tv4.validateMultiple(company, companyValidationSchema, undefined, true);

  // check the result
  if (!result.valid) {
    // throw validation error
    throw getSchemaError(result);
  }
  // update the param with Object id like assignedCompanies
  return updateParam(company, userId);
}

export default class CompanyController {

  create(param, userId) {
    return updateParam(param, userId).then(createCompany);
  }

  remove(id) {
    return getCompany(id).then(company => {
      // remove directly when no logo
      if (!company.logo) {
        return company.remove();
      }
      return company.removeLogo().then(() => company.remove());
    });
  }

  getAll(filter, { pageNo, pageSize }, sort) {
    const query = Company.find(filter, '-_id -__v')
      .skip(pageNo * pageSize)
      .limit(pageSize)
      .sort(sort);
    return doPopulateData(query);
  }

  getTotal(filter) {
    return Company.find(filter).count();
  }

  get(id) {
    return getCompany(id, '-_id -__v', true);
  }

  getLogo(id) {
    return Company.getLogo(id);
  }

  createLogo(file, companyId) {
    return getCompany(companyId).then(company => {
      if (company.logo) {
        return company.removeLogo().then(() =>
          company.addLogo(file.path, {
            mimeType: file.mimetype,
            filename: file.originalname,
          }));
      }
      return company.addLogo(file.path, {
        mimeType: file.mimetype,
        filename: file.originalname,
      });
    })
    .catch((err) => {
       // remove the file if any failure like not existing company id.
      if (file.path && fs.statSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      throw err;
    });
  }

  removeLogo(companyId) {
    return getCompany(companyId).then(company => {
      if (company.logo) {
        return company.removeLogo();
      }
      throw new NotFoundError('logo is not found');
    });
  }

  patch(id, patches, userId) {
    return getCompany(id)
      .then(company => {
        // filter the company, so it will remain the possible value to be set
        const expectedCompany = toSchemaFormat(company.toJSON());

        return applyPatch(expectedCompany, patches, userId)
          .then(updatedParam => {
            // apply the changes and update the values
            /* eslint no-param-reassign: ["error", { "props": false }]*/
            Object.keys(updatedParam).forEach(item => {
              // can't change the id
              if (item === 'id') {
                return;
              }
              company[item] = updatedParam[item];
            });

            // expect to return null to indicate it is updated instead of create
            return company.save()
              .then(() => null);
          });
      })
      .catch((err) => {
        // not found and create a new record
        if (err && err.name === ArgumentError.name) {
          // default will have a username
          return applyPatch({
            id,
          }, patches, userId)
            .then(createCompany);
        }
        throw err;
      });
  }

  replace(id, param, userId) {
    return updateParam(param, userId)
      .then((updatedParam) =>
        getCompany(id)
          .then((company) => {
            // replace the previous the record and create again
            const { createdBy, createdAt } = company;
            return this.remove(id)
              .then(() => {
                // need to update back the original data
                const newCompany = new Company(updatedParam);
                newCompany.createdBy = createdBy;
                newCompany.createdAt = createdAt;
                return newCompany.save()
                // return null to indicate it is updated
                .then(() => null);
              });
          })
          .catch((err) => {
            if (err && err.name === ArgumentError.name) {
              return createCompany(updatedParam);
            }
            throw err;
          })
      );
  }

  static getObjectId(id) {
    return convertIdToObjectId(id);
  }
}
