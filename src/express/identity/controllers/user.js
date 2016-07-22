import { ArgumentError } from 'common-errors';
import Q from 'q';
import tv4 from 'tv4';
import * as jsonpatch from 'fast-json-patch';

import userValidationSchema from '../../../validationSchema/user.json';
import User from '../../../collections/user';
import CompanyController from './company';
import { filterProperties } from '../utils/helper';
import { mongooseError,
   getSchemaError,
   jsonPatchError,
} from '../../../utils/errorHelper';

// hashed information and token should not be displayed
const removeDisplayAttribte = '-__v -hashedPassword -salt -tokens';

/**
 * To inject the populate option into the query
 * @method doPopulateData
 * @param {Object} query the query
 * @returns {Object} the updated query
 */
function doPopulateData(query) {
  return query.populate('affiliatedCompany.company', 'id -_id')
         .populate('assignedCompanies.company', 'id -_id')
         .populate('createdBy', 'username -_id')
         .populate('updatedBy', 'username -_id');
}

/**
 * To get the user
 * @method getUser
 * @param {String} username the username
 * @param {Object} option the query option
 * @param {Boolean} populate the ref data
 * @returns {Promise<Object>} the user object
 */
function getUser(username, option, populateData) {
  const query = User.findOne({ username }, option);
  if (populateData) {
    doPopulateData(query);
  }
  return query.then(user => {
    if (!user) {
      throw new ArgumentError(`user username ${username} is not found`);
    }
    return user;
  });
}

/**
 * To update the filter
 * @method updateFilter
 * @param {Object} param the current parameter
 * @returns {Promise<Object>} the updated filter
 */
function updateFilter(filter) {
  const myFilter = filter;
  const promiseArray = [];
  if (filter['assignedCompanies.company']) {
    promiseArray.push(CompanyController.getObjectId(filter['assignedCompanies.company'])
      .then((companyObjectId) => {
        myFilter['assignedCompanies.company'] = companyObjectId;
      }));
  }
  if (filter['affiliatedCompany.company']) {
    promiseArray.push(CompanyController.getObjectId(filter['affiliatedCompany.company'])
      .then((companyObjectId) => {
        myFilter['affiliatedCompany.company'] = companyObjectId;
      }));
  }
  return Q.all(promiseArray)
    .then(() => myFilter);
}

/**
 * To update the parameter, linking the ref object id
 * @method updateParam
 * @param {Object} param the current parameter
 * @param {String} userId the user who perform the action
 * @returns {Promise<Object>} the updated user object
 */
function updateParam(param, userId) {
  const mParam = param;
  const promiseArray = [];
  const updatedAssignmentCompanies = [];

  // userId
  if (userId) {
    mParam.updatedBy = userId;
  }
  // find company id
  if (param.affiliatedCompany && param.affiliatedCompany.company) {
    promiseArray.push(
      CompanyController.getObjectId(param.affiliatedCompany.company)
        .then(companyObjectId => {
          mParam.affiliatedCompany.company = companyObjectId;
        })
    );
  }

  if (param.assignedCompanies && param.assignedCompanies.length > 0) {
    param.assignedCompanies.forEach((item) => {
      promiseArray.push(CompanyController.getObjectId(item.company)
        .then(companyObjectId => {
          updatedAssignmentCompanies.push({
            company: companyObjectId,
            department: item.department,
          });
        }));
    });
  }

  return Q.all(promiseArray).then(() => {
    mParam.assignedCompanies = updatedAssignmentCompanies;
    return mParam;
  });
}

/**
 * To filter extra properties based on the schema format
 * @method toSchemaFormat
 * @param {Object} user the current user object
 * @returns {Object} the filter user object
 */
function toSchemaFormat(userJSON) {
  const userFilteredProperties = filterProperties(userJSON, userValidationSchema.properties);
  // because fail to get password directly, setting a dumy so user can update/add
  userFilteredProperties.password = '';
  return userFilteredProperties;
}

/**
 * To perform patch action
 * @method applyPatch
 * @param {Object} user the current user object
 * @param {Object[]} patches the json patches array
 * @param {String} userId the person who perform patch
 * @throws {ValidationError} the json patch is not valid
 * @returns {Object} the updated object
 */
function applyPatch(user, patches, userId) {
  // apply the patches on the possible properies in schema
  try {
    jsonpatch.apply(user, patches, true);
  } catch (ex) {
    throw jsonPatchError(ex);
  }

  // undergo validation to see if any unexpected format or changes
  const result = tv4.validateMultiple(user, userValidationSchema, undefined, true);

  // check the result
  if (!result.valid) {
    // throw validation error
    throw getSchemaError(result);
  }
  // update the param with Object id like assignedCompanies
  return updateParam(user, userId);
}

/**
 * To perform create action
 * @method create
 * @param {Object} param the user parameter
 * @returns {Promise<User>} when successfully create a user
 */
function createUser(param) {
  if (param.updatedBy) {
    param.createdBy = param.updatedBy;
  }
  return User.create(param).catch(mongooseError);
}

export default class UserController {

  /**
   * create a user
   * @method create
   * @param {Object} param the user parameter
   * @param {String} userId the person who create user
   * @returns {Promise<User>} when successfully create a user
   */
  create(param, userId) {
    return updateParam(param, userId).then(createUser);
  }

  /**
   * remove a user
   * @method remove
   * @param {String} username
   * @returns {Promise<>} when succeed to remove a user
   */
  remove(username) {
    return getUser(username).then(user => user.remove());
  }

  /**
   * get all the users based on the filter
   * @method getAll
   * @param {Object} filter
   * @param {Object} pagination the pagination object
   * @param {Number} pagination.pageNo the page number
   * @param {Number} pagination.pageSize the page size
   * @param {Object} sort the sort object
   * @returns {Promise<User>} the users
   */
  getAll(filter, { pageNo, pageSize }, sort) {
    return updateFilter(filter)
      .then(myFilter => {
        const query = User.find(myFilter, removeDisplayAttribte)
          .skip(pageNo * pageSize)
          .limit(pageSize)
          .sort(sort);
        return doPopulateData(query);
      }).catch(mongooseError);
  }

  /**
   * get the total count of users based on the filter
   * @method getTotal
   * @param {Object} filter
   * @returns {Promise<Number>} the number of users
   */
  getTotal(filter) {
    return updateFilter(filter)
      .then(myFilter => User.find(myFilter).count());
  }

  /**
   * get the user data
   * @method get
   * @param {String} username
   * @returns {Promise<Object>} the user object
   */
  get(username) {
    return getUser(username, removeDisplayAttribte, true);
  }

  /**
   * patch the user data
   * @method patch
   * @param {String} username
   * @param {Object[]} patches the json patch array
   * @param {String} userId the user id who perform patch
   * @returns {Promise<Object>} the user object when create a new user
   * @returns {Promise<>} replace the existing user
   */
  patch(username, patches, userId) {
    return getUser(username, removeDisplayAttribte)
      .then(user => {
        // filter the user, so it will remain the possible value to be set
        const expectedUser = toSchemaFormat(user.toJSON());

        return applyPatch(expectedUser, patches, userId)
          .then(updatedParam => {
            // apply the changes and update the values
            /* eslint no-param-reassign: ["error", { "props": false }]*/
            Object.keys(updatedParam).forEach(item => {
              // can't change the username and ignore update password if it is empty
              if (item === 'username' || item === 'password' && !updatedParam[item]) {
                return;
              }
              user[item] = updatedParam[item];
            });

            // expect to return null to indicate it is updated instead of create
            return user.save()
              .then(() => null);
          });
      })
      .catch((err) => {
        // not found and create a new record
        if (err && err.name === ArgumentError.name) {
          // default will have a username
          return applyPatch({
            username,
          }, patches, userId)
            .then(createUser);
        }
        throw err;
      });
  }

  /**
   * replace the user data
   * @method replace
   * @param {String} username
   * @param {Object} param the data parameter
   * @param {String} userId the user id who perform replace
   * @returns {Promise<Object>} the user object when create a new user
   * @returns {Promise<>} replace the existing user
   */
  replace(username, param, userId) {
    return updateParam(param, userId)
      .then((updatedParam) =>
        getUser(username)
          .then((user) => {
            // replace the previous the record and create again
            const { createdBy, createdAt } = user;
            return this.remove(username)
              .then(() => {
                // need to update back the original data
                const newUser = new User(updatedParam);
                newUser.createdBy = createdBy;
                newUser.createdAt = createdAt;
                return newUser.save()
                // return null to indicate it is updated
                .then(() => null);
              });
          })
          .catch((err) => {
            if (err && err.name === ArgumentError.name) {
              return createUser(updatedParam);
            }
            throw err;
          })
      );
  }
}
