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

/**
* @api {get} /identity/companies Get companies
* @apiName GetCompanies
* @apiGroup company
* @apiDescription get the companies
* @apiParam {Number} [size=20] the page size
* @apiParam {Number} [page=0] the page number
* @apiParam {String="id", "createdAt","updatedAt"} [sortBy=id] sort by field
* @apiParam {String="asc","desc"} [sortOrder=asc] sort by order
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
