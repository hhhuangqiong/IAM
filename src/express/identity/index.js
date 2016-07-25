import { Router } from 'express';
import bind from 'lodash/bind';

import companyFormat from '../../validationSchema/company.json';
import userFormat from '../../validationSchema/user.json';

import * as company from './routes/company';
import * as user from './routes/user';

import { validateData,
   uploadFile,
   updateGetAllParam,
   validatePatchFormat,
 } from './utils/helper';

const companyValidateData = bind(validateData, company, companyFormat);
const userValidateData = bind(validateData, user, userFormat);
const uploadLogo = bind(uploadFile, null, 'logo');
const companyUpdateParam = bind(updateGetAllParam, null, companyFormat);
const userUpdateParam = bind(updateGetAllParam, null, userFormat);

export const router = new Router();
// companies
/**
 * @apiDefine errorObject
 * @apiError {Object} result The error Object
 * @apiError {Number} result.code the error code
 * - 20000 General error
 * - 20001 ArgumentError, ArgumentNullError, key is missing or incorrect
 * - 20002 AlreadyInUseError, keys or resouces are in used
 * - 20003 ValidationError, the data formats or values are incorrect
 * @apiError {Number} result.status http status code
 * - 400 Client Error, general error
 * - 404 Not Found, it may be NotFoundError, null argument
 * - 409 Conflict, it may be AlreadyInUseError, duplicate keys
 * - 422 Unprocessable Entity, it may be ArgumentError, ArgumentNullError and ValidationError
 * @apiError {String} result.message the error message and description
 */

 /**
  * @apiDefine companyData
  * @apiSuccess (Company) {Date} updatedAt the time being updated
  * @apiSuccess (Company) {Date} createdAt the time being created
  * @apiSuccess (Company) {Object} updatedBy the user who last update
  * @apiSuccess (Company) {String} updatedBy.id the id of person who last update
  * @apiSuccess (Company) {Object} createdBy the user who create
  * @apiSuccess (Company) {String} createdBy.id the id of person who create
  * @apiSuccess (Company) {String} id Company unique id
  * @apiSuccess (Company) {String} country country
  * @apiSuccess (Company) {String} logo the logo url
  * @apiSuccess (Company) {Object} parent the parent company object
  * @apiSuccess (Company) {String} parent.id the parent company id
  * @apiSuccess (Company) {Boolean} reseller whether company is reseller or not
  * @apiSuccess (Company) {String} [name] name
  * @apiSuccess (Company) {String} [themeType] the theme type
  * @apiSuccess (Company) {Object} [address] address the address object
  * @apiSuccess (Company) {String} [address.formatted] formmated address
  * @apiSuccess (Company) {String} [address.streetAddress] address street address
  * @apiSuccess (Company) {String} [address.locality] address locality
  * @apiSuccess (Company) {String} [address.region] address region
  * @apiSuccess (Company) {String} [address.postalCode] address postal code
  * @apiSuccess (Company) {String} [address.country] address country
  * @apiSuccess (Company) {String} [timezone] the timezone like "UTC+8"
  * @apiSuccess (Company) {String} [accountManager] account manager
  * @apiSuccess (Company) {Object[]} [businessContact] business contact array
  * @apiSuccess (Company) {String} [businessContact.name] contact name
  * @apiSuccess (Company) {String} [businessContact.phone] contact phone number
  * @apiSuccess (Company) {String} [businessContact.email] contact email
  * @apiSuccess (Company) {Object[]} [technicalContact] technical contact array
  * @apiSuccess (Company) {String} [technicalContact.name] contact name
  * @apiSuccess (Company) {String} [technicalContact.phone] contact phone number
  * @apiSuccess (Company) {String} [technicalContact.email] contact email
  * @apiSuccess (Company) {Object[]} [supportContact] support contact array
  * @apiSuccess (Company) {String} [supportContact.name] contact name
  * @apiSuccess (Company) {String} [supportContact.phone] contact phone number
  * @apiSuccess (Company) {String} [supportContact.email] contact email
  */

/**
 * @apiDefine inputParam
 * @apiParam {String} id Company unique id
 * @apiParam {String} country country
 * @apiParam {String} [parent] the parent company id
 * @apiParam {Boolean} [reseller=false] whether company is reseller or not
 * @apiParam {String} [name] name
 * @apiParam {String} [themeType] the theme type
 * @apiParam {Object} [address] address the address object
 * @apiParam {String} [address.formatted] formmated address
 * @apiParam {String} [address.streetAddress] address street address
 * @apiParam {String} [address.locality] address locality
 * @apiParam {String} [address.region] address region
 * @apiParam {String} [address.postalCode] address postal code
 * @apiParam {String} [address.country] address country
 * @apiParam {String} [timezone] the timezone like "UTC+8"
 * @apiParam {String} [accountManager] account manager
 * @apiParam {Object[]} [businessContact] business contact array
 * @apiParam {String} [businessContact.name] contact name
 * @apiParam {String} [businessContact.phone] contact phone number
 * @apiParam {String} [businessContact.email] contact email
 * @apiParam {Object[]} [technicalContact] technical contact array
 * @apiParam {String} [technicalContact.name] contact name
 * @apiParam {String} [technicalContact.phone] contact phone number
 * @apiParam {String} [technicalContact.email] contact email
 * @apiParam {Object[]} [supportContact] support contact array
 * @apiParam {String} [supportContact.name] contact name
 * @apiParam {String} [supportContact.phone] contact phone number
 * @apiParam {String} [supportContact.email] contact email
 */

/**
 * @api {post} /identity/companies Create a company
 * @apiName PostCompany
 * @apiGroup company
 * @apiDescription create a new company
 * @apiHeader {String} Content-Type application/json
 * @apiUse inputParam
 * @apiSuccess (Success 201) {String} id the company id
 * @apiUse errorObject
 * @apiHeaderExample {json} Header-Example:
 * { "Content-Type": "application/json" }
 * @apiParamExample {json} Request-Example:
 * {
 *     "id": "companyTest",
 *     "country": "Hong Kong",
 *     "reseller": true,
 *     "name": "Another name",
 *     "themeType": "awesome",
 *     "address": {
 *      "formatted": "2 Tim Mei Avenue, Tamar, Hong Kong",
 *       "streetAddress": "2 Tim Mei Avenue",
 *       "country": "Hong Kong"
 *     },
 *     "timezone": "UTC+8",
 *     "accountManager": "Marco",
 *     "businessContact": [{
 *       "name": "Marco",
 *       "phone": "612345678",
 *       "email": "Marco@abc.com"
 *     }],
 *     "technicalContact": [{
 *       "name": "Marco F",
 *       "phone": "612345679",
 *       "email": "MarcoF@abc.com"
 *     }],
 *     "supportContact": [{
 *       "name": "Marco Fa",
 *       "phone": "612345670",
 *       "email": "MarcoFa@abc.com"
 *    }]
 * }
 * @apiSuccessExample {json} Success-Response:
 *     // Header: access link to the company entity
 *     Location: /identity/companies/companyTest
 *     HTTP/1.1 201 Created
 *     {
 *       "id": "companyTest"
 *     }
 * @apiErrorExample Conflict Keys Error-Response:
 *     HTTP/1.1 409 Conflict
 *     {
 *       "result": {
 *          "code": 20002,
 *          "status": 409,
 *          "message": "The specified 'companyTest' value is already in use for: "
 *        }
 *     }
 * @apiErrorExample Missing Required keys  Error-Response:
 *     HTTP/1.1 422 Unprocessable Entity
 *     {
 *       "result": {
 *          "code": 20001,
 *          "status": 422,
 *          "message": "Missing argument: id "
 *        }
 *     }
 * @apiErrorExample Invalid data  Error-Response:
 *     HTTP/1.1 422 Unprocessable Entity
 *     {
 *       "result": {
 *          "code": 20003,
 *          "status": 422,
 *          "message": "/address with Invalid type: string (expected object) "
 *        }
 *     }
 */
router.post('/companies', company.validateRequired, companyValidateData, company.create);

/**
 * @api {get} /identity/companies Get companies
 * @apiName GetCompanies
 * @apiGroup company
 * @apiDescription get the companies
 * @apiParam {Number} [size=20] the page size
 * @apiParam {Number} [page=0] the page number
 * @apiParam {String="id", "createdAt","updatedAt"} [sortBy=id] sort by field
 * @apiParam {String="asc","desc","ascending","descending","1","-1"} [sortOrder=asc] sort by order
 * @apiSuccess {Number} total the total number
 * @apiSuccess {Number} page_size the number of result per page
 * @apiSuccess {Number} page_no the current page number
 * @apiSuccess {Company[]} resources array of Company Object
 * @apiUse companyData
 * @apiUse errorObject
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          "total": 1,
 *          "page_size": 20,
 *          "page_no": 0,
 *          "resources": [
 *            {
 *              "updatedAt": "2016-07-17T12:44:46.194Z",
 *              "createdAt": "2016-07-16T17:28:27.222Z",
 *              "createdBy": {
 *                "id": "thomas1lee@maaii.com"
 *              },
 *              "updatedBy": {
 *                "id": "thomas1lee@maaii.com"
 *              },
 *              "logo": "http://localhost:3000/identity/companies/logo/578b235999de20be8cf68b26",
 *              "id": "companyTest",
 *              "country": "Hong Kong",
 *              "reseller": true,
 *              "name": "Another name",
 *              "themeType": "awesome",
 *              "address": {
 *                "formatted": "2 Tim Mei Avenue, Tamar, Hong Kong",
 *                "streetAddress": "2 Tim Mei Avenue",
 *                "country": "Hong Kong"
 *              },
 *              "timezone": "UTC+8",
 *              "accountManager": "Marco",
 *              "businessContact": [{
 *                "name": "Marco",
 *                "phone": "612345678",
 *                "email": "Marco@abc.com"
 *              }],
 *              "technicalContact": [{
 *                "name": "Marco F",
 *                "phone": "612345679",
 *                "email": "MarcoF@abc.com"
 *              }],
 *              "supportContact": [{
 *                "name": "Marco Fa",
 *                "phone": "612345670",
 *                "email": "MarcoFa@abc.com"
 *             }]
 *          }]
 *     }
 */
router.get('/companies', companyUpdateParam, company.getAll);

/**
 * @api {get} /identity/companies/:id Get a company
 * @apiName GetCompany
 * @apiGroup company
 * @apiDescription get a company by id
 * @apiParam {String} id the expected company id
 * @apiUse companyData
 * @apiUse errorObject
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "updatedAt": "2016-07-17T12:44:46.194Z",
 *       "createdAt": "2016-07-16T17:28:27.222Z",
 *       "createdBy": {
 *         "id": "thomas1lee@maaii.com"
 *       },
 *       "updatedBy": {
 *         "id": "thomas1lee@maaii.com"
 *       },
 *       "logo": "http://localhost:3000/identity/companies/logo/578b235999de20be8cf68b26",
 *       "id": "companyTest",
 *       "country": "Hong Kong",
 *       "reseller": true,
 *       "name": "Another name",
 *       "themeType": "awesome",
 *       "address": {
 *         "formatted": "2 Tim Mei Avenue, Tamar, Hong Kong",
 *         "streetAddress": "2 Tim Mei Avenue",
 *         "country": "Hong Kong"
 *       },
 *       "timezone": "UTC+8",
 *       "accountManager": "Marco",
 *       "businessContact": [{
 *         "name": "Marco",
 *         "phone": "612345678",
 *         "email": "Marco@abc.com"
 *       }],
 *       "technicalContact": [{
 *         "name": "Marco F",
 *         "phone": "612345679",
 *         "email": "MarcoF@abc.com"
 *       }],
 *       "supportContact": [{
 *         "name": "Marco Fa",
 *         "phone": "612345670",
 *         "email": "MarcoFa@abc.com"
 *      }]
 *    }
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "result": {
 *          "code": 20001,
 *          "status": 404,
 *          "message": "Invalid or missing argument supplied: company id noCompany is not found"
 *        }
 *     }
 */
router.get('/companies/:id', company.get);

// an route to get the logo resource by id mentioned in the company profile
router.get('/companies/logo/:id', company.getLogo);
/**
 * @api {post} /identity/companies/:id/logo Post company logo
 * @apiName PostCompanyLogo
 * @apiGroup company
 * @apiDescription upload the company logo
 * @apiHeader {String} Content-Type multipart/form-data
 * @apiHeaderExample {json} Header-Example:
 * { "Content-Type": "multipart/form-data" }
 * @apiParam {String} id the target company id
 * @apiParam {File} logo the logo file
 * @apiSuccess (Success 201){String} id the logo file id
 * @apiUse errorObject
 * @apiSuccessExample {json} Success-Response:
 *     // Header: access link to the logo entity
 *     Location: /identity/companies/logo/578b8850bf88de2d8ff5f737
 *     HTTP/1.1 201 Created
 *     {
 *       "id": "578b8850bf88de2d8ff5f737"
 *     }
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 422 Unprocessable Entity
 *     {
 *       "result": {
 *          "code": 20001,
 *          "status": 422,
 *          "message": "Invalid or missing argument supplied: company id NosuchCompany is not found"
 *        }
 *     }
 */
router.post('/companies/:id/logo', uploadLogo, company.createLogo);

/**
 * @api {delete} /identity/companies/:id/logo Delete company logo
 * @apiName DeleteCompanyLogo
 * @apiGroup company
 * @apiDescription delete the company logo
 * @apiParam {String} id the target company id
 * @apiUse errorObject
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 204 No Content
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "result": {
 *          "code": 20001,
 *          "status": 404,
 *          "message": "Not Found: \"logo is not found\""
 *        }
 *     }
 */
router.delete('/companies/:id/logo', company.removeLogo);

/**
 * @api {delete} /identity/companies/:id Delete company
 * @apiName DeleteCompany
 * @apiGroup company
 * @apiDescription delete the company
 * @apiParam {String} id the target company id
 * @apiUse errorObject
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 204 No Content
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "result": {
 *          "code": 20001,
 *          "status": 404,
 *          "message": "Invalid or missing argument supplied: company id NotCompany is not found"
 *        }
 *     }
 */
router.delete('/companies/:id', company.remove);

/**
 * @api {patch} /identity/companies/:id Patch company
 * @apiName PatchCompany
 * @apiGroup company
 * @apiDescription update the company, it will only update the data.
 * If the company doesn't exist, it will create a new company.
 * @apiParam {String} id the target company id
 * @apiHeader {String} Content-Type application/json
 * @apiHeaderExample {json} Header-Example:
 * { "Content-Type": "application/json" }
 * @apiParam {Array}  op Array of operation following RFC 6902(https://tools.ietf.org/html/rfc6902)
 * @apiSuccessExample {json} Updated Data success-Response:
 *     HTTP/1.1 204 No Content
 * @apiSuccessExample {json} New created Success-Response:
 *     // Header: access link to the company entity
 *     Location: /identity/companies/companyTest
 *     HTTP/1.1 201 Created
 *     {
 *       "id": "companyTest"
 *     }
 * @apiUse errorObject
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 422 Unprocessable Entity
 *     {
 *       "result": {
 *          "code": 20003,
 *          "status": 422,
 *          "message": "/timezone with Invalid type: number (expected string)"
 *        }
 *     }
 * @apiErrorExample Invalid operation Error-Response:
 *     HTTP/1.1 422 Unprocessable Entity
 *     {
 *       "result": {
 *          "code": 20003,
 *          "status": 422,
 *          "message": 'Invalid operation number 0: Operation `op` property ' +
 *                       'is not one of operations defined in RFC-6902',
 *        }
 *     }
 * @apiErrorExample Invalid format Error-Response:
 *     HTTP/1.1 422 Unprocessable Entity
 *     {
 *       "result": {
 *          "code": 20003,
 *          "status": 422,
 *          "message": 'Patch requests a set of changes in an array'
 *        }
 *     }
 * @apiErrorExample Invalid schema Error-Response:
 *     HTTP/1.1 422 Unprocessable Entity
 *     {
 *       "result": {
 *          "code": 20003,
 *          "status": 422,
 *          "message": '/nonExisting with Unknown property (not in schema)'
 *        }
 *     }
 */
router.patch('/companies/:id', validatePatchFormat, company.patch);

/**
 * @api {put} /identity/companies/:id Put company
 * @apiName PutCompany
 * @apiGroup company
 * @apiDescription replace the company, it will replace all the data.
 * If the param doesn't exist, it will remove the existing data.
 * If the company doesn't exist, it will create a new company.
 * @apiParam {String} id the target company id
 * @apiHeader {String} Content-Type application/json
 * @apiHeaderExample {json} Header-Example:
 * { "Content-Type": "application/json" }
 * @apiUse inputParam
 * @apiSuccessExample {json} Updated Data success-Response:
 *     HTTP/1.1 204 No Content
 * @apiSuccessExample {json} New created Success-Response:
 *     // Header: access link to the company entity
 *     Location: /identity/companies/companyTest
 *     HTTP/1.1 201 Created
 *     {
 *       "id": "companyTest"
 *     }
 * @apiUse errorObject
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 422 Unprocessable Entity
 *     {
 *       "result": {
 *          "code": 20003,
 *          "status": 422,
 *          "message": "/timezone with Invalid type: number (expected string)"
 *        }
 *     }
 */
router.put('/companies/:id', company.validateRequired, companyValidateData, company.replace);

// user

/**
 * @apiDefine userInputParam
 * @apiParam {String} id User unique id
 * @apiParam {Boolean} [isRoot=false] Root user or not
 * @apiParam {Object} [name] name  object
 * @apiParam {String} [name.formatted] formatted name
 * @apiParam {String} [name.familyName] the family name
 * @apiParam {String} [name.givenName] the given name
 * @apiParam {String} [name.middleName] middle name
 * @apiParam {String} [name.honorificPrefix] honorific prefix
 * @apiParam {String} [name.honorificSuffix] honorific suffix
 * @apiParam {String} [nickName] nick name
 * @apiParam {String} [title] the title
 * @apiParam {String} [profileUrl] points to a location representing the user's online profile
 * @apiParam {String} [userType] the relationship between the organization and the user
 * @apiParam {String} [preferredLanguage] preferred language
 * @apiParam {String} [locale] locale
 * @apiParam {String} [timezone] timezone
 * @apiParam {Boolean} [active] user active status
 * @apiParam {String} [password] password
 * @apiParam {Object[]} [emails] email address
 * @apiParam {Boolean} [emails.primary]
 * @apiParam {String} [emails.type]
 * @apiParam {String} [emails.display]
 * @apiParam {String} [emails.value]
 * @apiParam {Boolean} [emails.verified]
 * @apiParam {Object[]} [phoneNumbers]
 * @apiParam {Boolean} [phoneNumbers.primary]
 * @apiParam {String} [phoneNumbers.type]
 * @apiParam {String} [phoneNumbers.display]
 * @apiParam {String} [phoneNumbers.value]
 * @apiParam {Boolean} [phoneNumbers.verified]
 * @apiParam {Object[]} [ims] ims array
 * @apiParam {Boolean} [ims.primary]
 * @apiParam {String} [ims.type]
 * @apiParam {String} [ims.display]
 * @apiParam {String} [ims.value]
 * @apiParam {Object[]} [photos] photoes
 * @apiParam {Boolean} [photos.primary]
 * @apiParam {String} [photos.type]
 * @apiParam {String} [photos.display]
 * @apiParam {String} [photos.value]
 * @apiParam {Object[]} [addresses] addresses
 * @apiParam {String} [addresses.formated] formatted address
 * @apiParam {String} [addresses.streetAddress] street addres
 * @apiParam {String} [addresses.locality] address locality
 * @apiParam {String} [addresses.region] address region
 * @apiParam {String} [addresses.country] address country
 * @apiParam {String} [addresses.postalCode] address postal code
 * @apiParam {String} [addresses.type] address type
 * @apiParam {Object[]} [x509Certificates] x509 certificates
 * @apiParam {Boolean} [x509Certificates.primary] primary or not
 * @apiParam {String} [x509Certificates.type] certificate type
 * @apiParam {String} [x509Certificates.display] display of certificate
 * @apiParam {String} [x509Certificates.value]  certificate value
 * @apiParam {String} [gender] gender
 * @apiParam {String} [birthdate] birth date
 * @apiParam {Object[]} [website] website
 * @apiParam {String} [affiliatedCompany.company] affiliated companyid
 * @apiParam {String} [affiliatedCompany.department] affiliated company department
 * @apiParam {Object[]} [assignedCompanies] assigned companies
 * @apiParam {String} [assignedCompanies.company] assigned company id
 * @apiParam {String} [assignedCompanies.department] assigned company department
 */

 /**
  * @apiDefine userData
  * @apiSuccess (User) {Date} updatedAt the time being updated
  * @apiSuccess (User) {Date} createdAt the time being created
  * @apiSuccess (User) {Object} updatedBy the user who last update
  * @apiSuccess (User) {String} updatedBy.id the id of person who last update
  * @apiSuccess (User) {Object} createdBy the user who create
  * @apiSuccess (User) {String} createdBy.id the id of person who create
  * @apiSuccess (User)  id User unique id
  * @apiSuccess (User) {Boolean} [isRoot=false] Root user or not
  * @apiSuccess (User) {Object} [name] name  object
  * @apiSuccess (User) {String} [name.formatted] formatted name
  * @apiSuccess (User) {String} [name.familyName] the family name
  * @apiSuccess (User) {String} [name.givenName] the given name
  * @apiSuccess (User) {String} [name.middleName] middle name
  * @apiSuccess (User) {String} [name.honorificPrefix] honorific prefix
  * @apiSuccess (User) {String} [name.honorificSuffix] honorific suffix
  * @apiSuccess (User) {String} [nickName] nick name
  * @apiSuccess (User) {String} [title] the title
  * @apiSuccess (User) {String} [profileUrl] points to a location representing the user's online profile
  * @apiSuccess (User) {String} [userType] the relationship between the organization and the user
  * @apiSuccess (User) {String} [preferredLanguage] preferred language
  * @apiSuccess (User) {String} [locale] locale
  * @apiSuccess (User) {String} [timezone] timezone
  * @apiSuccess (User) {Boolean} [active] user active status
  * @apiSuccess (User) {String} [displayName] given name and first name
  * @apiSuccess (User) {Object[]} [emails] email address
  * @apiSuccess (User) {Boolean} [emails.primary]
  * @apiSuccess (User) {String} [emails.type]
  * @apiSuccess (User) {String} [emails.display]
  * @apiSuccess (User) {String} [emails.value]
  * @apiSuccess (User) {Boolean} [emails.verified]
  * @apiSuccess (User) {Object[]} [phoneNumbers]
  * @apiSuccess (User) {Boolean} [phoneNumbers.primary]
  * @apiSuccess (User) {String} [phoneNumbers.type]
  * @apiSuccess (User) {String} [phoneNumbers.display]
  * @apiSuccess (User) {String} [phoneNumbers.value]
  * @apiSuccess (User) {Boolean} [phoneNumbers.verified]
  * @apiSuccess (User) {Object[]} [ims] ims array
  * @apiSuccess (User) {Boolean} [ims.primary]
  * @apiSuccess (User) {String} [ims.type]
  * @apiSuccess (User) {String} [ims.display]
  * @apiSuccess (User) {String} [ims.value]
  * @apiSuccess (User) {Object[]} [photos] photoes
  * @apiSuccess (User) {Boolean} [photos.primary]
  * @apiSuccess (User) {String} [photos.type]
  * @apiSuccess (User) {String} [photos.display]
  * @apiSuccess (User) {String} [photos.value]
  * @apiSuccess (User) {Object[]} [addresses] addresses
  * @apiSuccess (User) {String} [addresses.formated] formatted address
  * @apiSuccess (User) {String} [addresses.streetAddress] street addres
  * @apiSuccess (User) {String} [addresses.locality] address locality
  * @apiSuccess (User) {String} [addresses.region] address region
  * @apiSuccess (User) {String} [addresses.country] address country
  * @apiSuccess (User) {String} [addresses.postalCode] address postal code
  * @apiSuccess (User) {String} [addresses.type] address type
  * @apiSuccess (User) {Object[]} [x509Certificates] x509 certificates
  * @apiSuccess (User) {Boolean} [x509Certificates.primary] primary or not
  * @apiSuccess (User) {String} [x509Certificates.type] certificate type
  * @apiSuccess (User) {String} [x509Certificates.display] display of certificate
  * @apiSuccess (User) {String} [x509Certificates.value]  certificate value
  * @apiSuccess (User) {String} [gender] gender
  * @apiSuccess (User) {String} [birthdate] birth date
  * @apiSuccess (User) {Object[]} [website] website
  * @apiSuccess (User) {String} [affiliatedCompany.company] affiliated companyid
  * @apiSuccess (User) {String} [affiliatedCompany.department] affiliated company department
  * @apiSuccess (User) {Object[]} [assignedCompanies] assigned companies
  * @apiSuccess (User) {String} [assignedCompanies.company] assigned company id
  * @apiSuccess (User) {String} [assignedCompanies.department] assigned company department
  */

 /**
  * @api {post} /identity/users Create a user
  * @apiName PostUser
  * @apiGroup user
  * @apiDescription create a new user
  * @apiHeader {String} Content-Type application/json
  * @apiUse userInputParam
  * @apiSuccess (Success 201) {String} id the id
  * @apiUse errorObject
  * @apiHeaderExample {json} Header-Example:
  * { "Content-Type": "application/json" }
  * @apiParamExample {json} Request-Example:
  *   {
  *      "isRoot":true,
  *      "id":"user@test.abc",
  *       "name":{
  *         "formatted":"Johnny M. Richmond",
  *         "familyName":"Richmond",
  *         "givenName":"Johnny",
  *         "middleName":"M"
  *       },
  *       "nickName":"Johnny R",
  *       "profileUrl":"http://google.com",
  *       "title":"FBI",
  *       "userType":"internal",
  *       "preferredLanguage":"en",
  *       "timezone":"UTC+8",
  *       "active":true,
  *       "emails":[{
  *           "primary":true,
  *           "type":"work",
  *           "display":"user@test.abc",
  *           "value":"user@test.abc",
  *           "verified":false
  *         }],
  *       "phoneNumbers":[{
  *         "primary":true,
  *         "type":"work",
  *         "value":"912345678",
  *         "verified":false
  *       },{
  *         "type":"home",
  *         "value":"212345678",
  *         "verified":false
  *       }],
  *       "ims":[{
  *         "primary":true,
  *         "type":"skype",
  *         "value":"johnnyR"
  *       }],
  *       "photos":[{
  *         "type":"photo",
  *         "value":"http://abc.com/image.png"
  *       }],
  *      "addresses":[{
  *         "formatted":"2 Tim Mei Avenue, Tamar, Hong Kong",
  *         "streetAddress":"2 Tim Mei Avenue",
  *         "country":"Hong Kong",
  *         "type":"work"
  *       }],
  *       "x509Certificates":[{
  *         "value":"MIIDQzCCAqygAwIBAgICEAAwDQYJKoZIhvcNAQEFBQAwTjELMAkGA1UEBhMCV="
  *       }]
  *    }
  * @apiSuccessExample {json} Success-Response:
  *     // Header: access link to the user entity
  *     Location: /identity/users/user@test.abc
  *     HTTP/1.1 201 Created
  *     {
  *       "id": "user@test.abc"
  *     }
  * @apiErrorExample Conflict Keys Error-Response:
  *     HTTP/1.1 409 Conflict
  *     {
  *       "result": {
  *          "code": 20002,
  *          "status": 409,
  *          "message": "The specified 'admin@abc.com' value is already in use for: "
  *        }
  *     }
  * @apiErrorExample Missing Required keys  Error-Response:
  *     HTTP/1.1 422 Unprocessable Entity
  *     {
  *       "result": {
  *          "code": 20001,
  *          "status": 422,
  *          "message": "Missing argument: id "
  *        }
  *     }
  * @apiErrorExample Invalid data  Error-Response:
  *     HTTP/1.1 422 Unprocessable Entity
  *     {
  *       "result": {
  *          "code": 20003,
  *          "status": 422,
  *          "message": "/timezone with Invalid type: number (expected string) "
  *        }
  *     }
  */
router.post('/users', user.validateRequired, userValidateData, user.create);

/**
 * @api {get} /identity/users Get users
 * @apiName GetUsers
 * @apiGroup user
 * @apiDescription get the users
 * @apiParam {String} [id] filter by id
 * @apiParam {Number} [size=20] the page size
 * @apiParam {Number} [page=0] the page number
 * @apiParam {String="id", "updatedAt", "createdAt"} [sortBy=id] sort by field
 * @apiParam {String="asc","desc","ascending","descending","1","-1"} [sortOrder=asc] sort by order
 * @apiSuccess {Number} total the total number
 * @apiSuccess {Number} page_size the number of result per page
 * @apiSuccess {Number} page_no the current page number
 * @apiSuccess {Company[]} resources array of Company Object
 * @apiUse userData
 * @apiUse errorObject
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          "total": 1,
 *          "page_size": 20,
 *          "page_no": 0,
 *          "resources": [{
 *            "_id": "578fd41e59aa0a4fad48913c",
 *            "createdAt": "2016-07-20T19:42:22.398Z",
 *            "updatedAt": "2016-07-20T19:42:22.398Z",
 *            "id": "user@test.abc1",
 *            "nickName": "Johnny R",
 *            "profileUrl": "http://abd.com",
 *            "title": "FBI",
 *            "userType": "internal",
 *            "preferredLanguage": "en",
 *            "timezone": "UTC+8",
 *            "active": true,
 *            "x509Certificates": [{
 *                "value": "MIIDQzCCAqygAwIBAgICEAAwDQYJKoZIhvcNAQEFBQAwTjELMAkGA1UEBhMCV="
 *            }],
 *            "addresses": [{
 *                "formatted": "2 Tim Mei Avenue, Tamar, Hong Kong",
 *                "streetAddress": "2 Tim Mei Avenue",
 *                "country": "Hong Kong",
 *                "type": "work"
 *            }],
 *            "photos": [{
 *                "type": "photo",
 *                "value": "http://abc.com/image.png"
 *            }],
 *            "ims": [{
 *                "primary": true,
 *                "type": "skype",
 *                "value": "johnnyR"
 *            }],
 *            "phoneNumbers": [{
 *                "primary": true,
 *                "type": "work",
 *                "value": "912345678",
 *                "verified": false
 *              },{
 *                "type": "home",
 *                "value": "212345678",
 *                "verified": false
 *             }],
 *            "emails": [{
 *                "primary": true,
 *                "type": "work",
 *                "display": "user@test.abc",
 *                "value": "user@test.abc",
 *                "verified": false
 *              }],
 *            "name": {
 *              "formatted": "Johnny M. Richmond",
 *              "familyName": "Richmond",
 *              "givenName": "Johnny",
 *              "middleName": "M"
 *            },
 *            "isRoot": true,
 *            "displayName": "Johnny Richmond"
 *        }]
 *      }
 */
router.get('/users', userUpdateParam, user.getAll);

/**
 * @api {get} /identity/users/:id Get user
 * @apiName GetUser
 * @apiGroup user
 * @apiDescription get the user
 * @apiParam {String} id filter by id
 * @apiUse userData
 * @apiUse errorObject
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *        "_id": "578fd41e59aa0a4fad48913c",
 *        "createdAt": "2016-07-20T19:42:22.398Z",
 *        "updatedAt": "2016-07-20T19:42:22.398Z",
 *        "id": "user@test.abc1",
 *        "nickName": "Johnny R",
 *        "profileUrl": "http://abd.com",
 *        "title": "FBI",
 *        "userType": "internal",
 *        "preferredLanguage": "en",
 *        "timezone": "UTC+8",
 *        "active": true,
 *        "x509Certificates": [{
 *            "value": "MIIDQzCCAqygAwIBAgICEAAwDQYJKoZIhvcNAQEFBQAwTjELMAkGA1UEBhMCV="
 *        }],
 *        "addresses": [{
 *            "formatted": "2 Tim Mei Avenue, Tamar, Hong Kong",
 *            "streetAddress": "2 Tim Mei Avenue",
 *            "country": "Hong Kong",
 *            "type": "work"
 *        }],
 *        "photos": [{
 *            "type": "photo",
 *            "value": "http://abc.com/image.png"
 *        }],
 *        "ims": [{
 *            "primary": true,
 *            "type": "skype",
 *            "value": "johnnyR"
 *        }],
 *        "phoneNumbers": [{
 *            "primary": true,
 *            "type": "work",
 *            "value": "912345678",
 *            "verified": false
 *          },{
 *            "type": "home",
 *            "value": "212345678",
 *            "verified": false
 *         }],
 *        "emails": [{
 *            "primary": true,
 *            "type": "work",
 *            "display": "user@test.abc",
 *            "value": "user@test.abc",
 *            "verified": false
 *          }],
 *        "name": {
 *          "formatted": "Johnny M. Richmond",
 *          "familyName": "Richmond",
 *          "givenName": "Johnny",
 *          "middleName": "M"
 *        },
 *        "isRoot": true,
 *        "displayName": "Johnny Richmond"
 *      }
 */
router.get('/users/:id', user.validateRequired, user.get);

/**
 * @api {delete} /identity/users/:id Delete user
 * @apiName DeleteUser
 * @apiGroup user
 * @apiDescription delete the user
 * @apiParam {String} id the target id
 * @apiUse errorObject
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 204 No Content
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "result": {
 *          "code": 20001,
 *          "status": 404,
 *          "message": "Invalid or missing argument supplied: user id notExist@sample.org is not found'"
 *        }
 *     }
 */
router.delete('/users/:id', user.remove);

/**
 * @api {patch} /identity/users/:id
 * @apiName PatchCompany
 * @apiGroup company
 * @apiDescription update the user, it will only update the data.
 * If the company doesn't exist, it will create a new company.
 * @apiParam {String} id the target user
 * @apiHeader {String} Content-Type application/json
 * @apiHeaderExample {json} Header-Example:
 * { "Content-Type": "application/json" }
 * @apiParam {Array}  op Array of operation following RFC 6902(https://tools.ietf.org/html/rfc6902)
 * @apiSuccessExample {json} Updated Data success-Response:
 *     HTTP/1.1 204 No Content
 * @apiSuccessExample {json} New created Success-Response:
 *     // Header: access link to the company entity
 *     Location: /identity/users/newUser
 *     HTTP/1.1 201 Created
 *     {
 *       "id": "newUser"
 *     }
 * @apiUse errorObject
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 422 Unprocessable Entity
 *     {
 *       "result": {
 *          "code": 20003,
 *          "status": 422,
 *          "message": "/timezone with Invalid type: number (expected string)"
 *        }
 *     }
 * @apiErrorExample Invalid operation Error-Response:
 *     HTTP/1.1 422 Unprocessable Entity
 *     {
 *       "result": {
 *          "code": 20003,
 *          "status": 422,
 *          "message": 'Invalid operation number 0: Operation `op` property ' +
 *                       'is not one of operations defined in RFC-6902',
 *        }
 *     }
 * @apiErrorExample Invalid format Error-Response:
 *     HTTP/1.1 422 Unprocessable Entity
 *     {
 *       "result": {
 *          "code": 20003,
 *          "status": 422,
 *          "message": 'Patch requests a set of changes in an array'
 *        }
 *     }
 * @apiErrorExample Invalid schema Error-Response:
 *     HTTP/1.1 422 Unprocessable Entity
 *     {
 *       "result": {
 *          "code": 20003,
 *          "status": 422,
 *          "message": '/nonExisting with Unknown property (not in schema)'
 *        }
 *     }
 */
router.patch('/users/:id', validatePatchFormat, user.patch);

/**
 * @api {put} /identity/users/:id Put user
 * @apiName PutUser
 * @apiGroup user
 * @apiDescription replace the user, it will replace all the data.
 * If the param doesn't exist, it will remove the existing data.
 * If the company doesn't exist, it will create a new company.
 * @apiParam {String} id the target user
 * @apiHeader {String} Content-Type application/json
 * @apiHeaderExample {json} Header-Example:
 * { "Content-Type": "application/json" }
 * @apiUse inputParam
 * @apiSuccessExample {json} Updated Data success-Response:
 *     HTTP/1.1 204 No Content
 * @apiSuccessExample {json} New created Success-Response:
 *     // Header: access link to the company entity
 *     Location: /identity/users/newId
 *     HTTP/1.1 201 Created
 *     {
 *       "id": "newId"
 *     }
 * @apiUse errorObject
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 422 Unprocessable Entity
 *     {
 *       "result": {
 *          "code": 20003,
 *          "status": 422,
 *          "message": "/timezone with Invalid type: number (expected string)"
 *        }
 *     }
 */
router.put('/users/:id', user.validateRequired, userValidateData, user.replace);
