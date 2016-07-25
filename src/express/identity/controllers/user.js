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
  return query.populate('affiliatedCompany', 'id')
         .populate('assignedCompanies', 'id')
         .populate('createdBy', 'id')
         .populate('updatedBy', 'id');
}

/**
 * To get the user
 * @method getUser
 * @param {String} id the id
 * @param {Object} option the query option
 * @param {Boolean} populate the ref data
 * @returns {Promise<Object>} the user object
 */
function getUser(id, option, populateData) {
  const query = User.findOne({ _id: id }, option);
  if (populateData) {
    doPopulateData(query);
  }
  return query.then(user => {
    if (!user) {
      throw new ArgumentError(`user id ${id} is not found`);
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
 * @returns {Object} the updated user object
 */
function updateParam(param, userId) {
  const mParam = param;

  // userId
  if (userId) {
    mParam.updatedBy = userId;
  }

  return mParam;
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
    return createUser(updateParam(param, userId));
  }

  /**
   * remove a user
   * @method remove
   * @param {String} id
   * @returns {Promise<>} when succeed to remove a user
   */
  remove(id) {
    return getUser(id).then(user => user.remove());
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
    let updatedSort = {};
    // convert back the id to _id
    if (hasOwnProperty.call(sort, 'id')) {
      /* eslint no-underscore-dangle: ["error", { "allow": [ "_id"] }]*/
      updatedSort._id = sort.id;
    } else {
      updatedSort = sort;
    }
    return updateFilter(filter)
      .then(myFilter => {
        const query = User.find(myFilter, removeDisplayAttribte)
          .skip(pageNo * pageSize)
          .limit(pageSize)
          .sort(updatedSort);
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
   * @param {String} id
   * @returns {Promise<Object>} the user object
   */
  get(id) {
    return getUser(id, removeDisplayAttribte, true);
  }

  /**
   * patch the user data
   * @method patch
   * @param {String} id
   * @param {Object[]} patches the json patch array
   * @param {String} userId the user id who perform patch
   * @returns {Promise<Object>} the user object when create a new user
   * @returns {Promise<>} replace the existing user
   */
  patch(id, patches, userId) {
    return getUser(id, removeDisplayAttribte)
      .then(user => {
        // filter the user, so it will remain the possible value to be set
        const expectedUser = toSchemaFormat(user.toJSON());
        const updatedParam = applyPatch(expectedUser, patches, userId);
        // apply the changes and update the values
        /* eslint no-param-reassign: ["error", { "props": false }]*/
        Object.keys(updatedParam).forEach(item => {
          // can't change the id and ignore update password if it is empty
          if (item === 'id' || item === 'password' && !updatedParam[item]) {
            return;
          }
          user[item] = updatedParam[item];
        });

        // expect to return null to indicate it is updated instead of create
        return user.save()
          .then(() => null);
      })
      .catch((err) => {
        // not found and create a new record
        if (err && err.name === ArgumentError.name) {
          // default will have a id
          const updatedParam = applyPatch({
            id,
          }, patches, userId);
          return createUser(updatedParam);
        }
        throw err;
      });
  }

  /**
   * replace the user data
   * @method replace
   * @param {String} id
   * @param {Object} param the data parameter
   * @param {String} userId the user id who perform replace
   * @returns {Promise<Object>} the user object when create a new user
   * @returns {Promise<>} replace the existing user
   */
  replace(id, param, userId) {
    const updatedParam = updateParam(param, userId);
    return getUser(id)
      .then((user) => {
        // replace the previous the record and create again
        const { createdBy, createdAt } = user;
        return this.remove(id)
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
      });
  }
}
