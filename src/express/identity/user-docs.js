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

  /**
   * @api {get} /identity/users Get users
   * @apiName GetUsers
   * @apiGroup user
   * @apiDescription get the users
   * @apiParam {String} [id] filter by id
   * @apiParam {Number} [size=20] the page size
   * @apiParam {Number} [page=0] the page number
   * @apiParam {String="id", "updatedAt", "createdAt"} [sortBy=id] sort by field
   * @apiParam {String="asc","desc"} [sortOrder=asc] sort by order
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
