import { NotFoundError } from 'common-errors';
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

/**
 * inject the query with populate
 * @method doPopulateDate
 * @param {Object} query the query
 * @returns {Object} the injected query
 */
function doPopulateData(query) {
  return query.populate('parent')
         .populate('createdBy', 'username -_id')
         .populate('updatedBy', 'username -_id');
}

/**
 * Get the company from mongo
 * @method getCompany
 * @param {String} id the company id
 * @param {Object} option the query option
 * @param {Boolean} populateData whether populate the ref linked
 * @returns {Promise<Object>} the company object
 */
function getCompany(id, option, populateData) {
  const query = Company.findOne({ _id: id }, option);
  if (populateData) {
    doPopulateData(query);
  }
  return query.then(company => {
    if (!company) {
      throw new NotFoundError(`company id ${id}`);
    }
    return company;
  });
}

/**
 * To perform create company action
 * @method createCompany
 * @param {Object} param the current parameter
 * @returns {Promise<Object>} the updated user object
 */
function createCompany(param) {
  if (param.updatedBy) {
    param.createdBy = param.updatedBy;
  }
  return Company.create(param).catch(mongooseError);
}

/**
 * To update the parameter, linking the ref object id
 * @method updateParam
 * @param {Object} param the current parameter
 * @param {String} userId the user who perform the action
 * @returns {Object} the updated company object
 */
function updateParam(param, userId) {
  const mParam = param;
  if (userId) {
    mParam.updatedBy = userId;
  }
  return mParam;
}

/**
 * To filter extra properties based on the schema format
 * @method toSchemaFormat
 * @param {Object} user the current company object
 * @returns {Object} the filter company object
 */
function toSchemaFormat(companyJSON) {
  const userFilteredProperties = filterProperties(companyJSON, companyValidationSchema.properties);
  return userFilteredProperties;
}

/**
 * To perform patch action
 * @method applyPatch
 * @param {Object} user the current company object
 * @param {Object[]} patches the json patches array
 * @param {String} userId the person who perform patch
 * @throws {ValidationError} the json patch is not valid
 * @returns {Object} the updated object
 */
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
  /**
   * Create the company
   * @method create
   * @param {Object} param the company propeties
   * @returns {Promise<Object>} when successfully add the company and return company object
   */
  create(param, userId) {
    return createCompany(updateParam(param, userId));
  }

  /**
   * Remove the company by company id, it will remove both linked company logo and company profile
   * @method remove
   * @param {String} id the company id
   * @returns {Promise<[]>} when successfully remove the company
   */
  remove(id) {
    return getCompany(id).then(company => {
      // remove directly when no logo
      if (!company.logo) {
        return company.remove();
      }
      return company.removeLogo().then(() => company.remove());
    });
  }

  /**
   * Get all the companies based on the query with pagination and sorting
   * @method getAll
   * @param {Object} filter the filter object query
   * @param {Object} pagination the pagination object
   * @param {Number} pagination.pageNo the page number
   * @param {Number} pagination.pageSize the number of result per page
   * @returns {Promise<Object[]>} the array of user object
   */
  getAll(filter, { pageNo, pageSize }, sort) {
    let updatedSort = {};
    // convert back the id to _id
    if (hasOwnProperty.call(sort, 'id')) {
      /* eslint no-underscore-dangle: ["error", { "allow": [ "_id"] }]*/
      updatedSort._id = sort.id;
    } else {
      updatedSort = sort;
    }
    const query = Company.find(filter)
      .skip(pageNo * pageSize)
      .limit(pageSize)
      .sort(updatedSort);
    return doPopulateData(query);
  }

  /**
   * Get the total count
   * @method getTotal
   * @param {Object} filter the filter object query
   * @returns {Promise<Number>} the number of result
   */
  getTotal(filter) {
    return Company.find(filter).count();
  }

  /**
   * Obtain the company object
   * @method get
   * @param {String} id the company id
   * @returns {Promise<Object>} the company object
   */
  get(id) {
    return getCompany(id, null, true);
  }

  /**
   * Obtain the logo by logo object id
   * @method getLogo
   * @param {String} id the logo object id
   * @returns {Promise<Buffer>} when successfully found and return the logo data
   */
  getLogo(id) {
    return Company.getLogo(id);
  }

  /**
   * create and link up company logo, it will append the logo data into mongodb gridfs
   * and delete the files
   * @method createLogo
   * @param {File} file
   * @param {String} companyId the company to add the logo
   * @returns {Promise<>} when successfully add the logo to company
   */
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

  /**
   * remove the company's logo by company id
   * @method removeLogo
   * @param {String} companyId
   * @returns {Promise<>} when successfully remove the logo
   * @throws {NotFoundError} logo file doesn't exist
   */
  removeLogo(companyId) {
    return getCompany(companyId).then(company => {
      if (company.logo) {
        return company.removeLogo();
      }
      throw new NotFoundError('logo is not found');
    });
  }

  /**
   * patch the company data
   * @method patch
   * @param {String} id
   * @param {Object[]} patches the json patch operations
   * @param {String} userId the user id who patches the user
   * @returns {Promise<Object>} the company object when created new company
   * @returns {Promise<>} when successfully update the data
   */
  patch(id, patches, userId) {
    return getCompany(id)
      .then(company => {
        // filter the company, so it will remain the possible value to be set
        const expectedCompany = toSchemaFormat(company.toJSON());
        const updatedParam = applyPatch(expectedCompany, patches, userId);
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
      })
      .catch((err) => {
        // not found and create a new record
        if (err && err.name === NotFoundError.name) {
          const updatedParam = applyPatch({
            id,
          }, patches, userId);
          // default will have a username
          return createCompany(updatedParam);
        }
        throw err;
      });
  }

  /**
   * Replace the company data
   * @method replace
   * @param {String} id
   * @param {Object} param the company parameter
   * @param {String} userId the user id who replaces the user's data
   * @returns {Promise<Object>} the company object when created new company
   * @returns {Promise<>} when successfully replace the data
   */
  replace(id, param, userId) {
    const updatedParam = updateParam(param, userId);
    return getCompany(id)
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
        if (err && err.name === NotFoundError.name) {
          return createCompany(updatedParam);
        }
        throw err;
      });
  }
}
