/**
 * @apiDefine ValidationError
 * @apiError Validation Request validation failed
 *
 * @apiErrorExample Validation Error (example)
 *     HTTP/1.1 422 Unprocessable Entity
 *     {
 *       "message": "Request entity is invalid.",
 *       "type": "Validation",
 *       "details": [
 *          {
 *            "field": "fieldName",
 *            "type": "string.required",
 *            "message": "Field name is required"
 *          }
 *       ]
 *     }
 */

/**
 * @apiDefine NotFoundError
 * @apiError NotFound Primary or related resource was not found
 *
 * @apiErrorExample Not Found Error (example)
 *     HTTP/1.1 404 Not Found
 *     {
 *       "message": "Primary or related resource was not found. Resource key: [id]",
 *       "type": "NotFound"
 *     }
 */

 /**
  * @apiDefine roleParam
  * @apiParam {String} service Service id
  * @apiParam {String} company Company id
  * @apiParam {String} name the role name
  * @apiParam {Object} permissions the permission obejct
  * @apiParam {String[]="read","create","update","delete"} [permission.company] the company resource or other possible resource.
  *   when the action "create" or "update" or "delete", it will automatically add "read" permission to that resource.
  *   when the action "create" or "delete", it will automatically add "update" permission to that resource.
  */

/**
 * @api {post} /access/roles Create role
 * @apiName CreateRole
 * @apiUse roleParam
 * @apiGroup Role
 * @apiParamExample {json} Request-Example
 * {
 *     "name": "Sales Manager",
 *     "service": "iam",
 *     "company": "m800",
 *     "permissions": {
 *         "res1": ["read"],
 *         "res2": ["update", "read"]
 *     }
 * }
 *
 * @apiSuccessExample Success-Response
 *     HTTP/1.1 201 Created
 *     {
 *       "id": "578e42245658585414aa48ef",
 *       "name": "Sales Manager",
 *       "company": "m800",
 *       "service": "wlp",
 *       "permissions": {
 *          "res1": ["read"],
 *          "res2": ["update", "read"]
 *       }
 *     }
 *
 *  @apiUse NotFoundError
 *  @apiUse ValidationError
 */

 /**
  * @api {put} /access/roles/:roleId Update role
  * @apiName UpdateRole
  * @apiUse roleParam
  * @apiGroup Role
  * @apiParamExample {json} Request-Example
  * {
  *     "name": "Sales Manager",
  *     "service": "iam",
  *     "company": "m800",
  *     "permissions": {
  *         "res1": ["read"],
  *         "res2": ["update", "read"]
  *     }
  * }
  *
  * @apiSuccessExample Success-Response
  *     HTTP/1.1 200 OK
  *     {
  *       "id": "578e42245658585414aa48ef",
  *       "name": "Sales Manager",
  *       "company": "m800",
  *       "service": "wlp",
  *       "permissions": {
  *          "res1": ["read"],
  *          "res2": ["update", "read"]
  *       }
  *     }
  *
  *  @apiUse NotFoundError
  *  @apiUse ValidationError
  */

/**
 * @api {get} /access/roles Get roles
 * @apiName GetRoles
 * @apiGroup Role
 *
 * @apiParam {String} [service] Service id
 * @apiParam {String} [company] Company id
 *
 * @apiSuccessExample Success-Response
 *     HTTP/1.1 200 OK
 *     [
 *        {
 *           "_id": "5774d238efb2f0535997eec6"
 *            "name": "Sales Manager",
 *            "service": "iam",
 *            "company": "company-1"
 *        },
 *        {
 *            "_id": "5774d238efb2f0535997eec6"
 *            "name": "Sales Director",
 *            "service": "wlp",
 *            "company": "company-1"
 *        },
 *        {
 *            "_id": "5774d238efb2f0535997eec6"
 *            "name": "Admin",
 *            "service": "wlp",
 *            "company": "m800"
 *        }
 *     ]
 *
 *  @apiUse NotFoundError
 *  @apiUse ValidationError
 */


/**
 * @api {delete} /access/roles/:id Delete role
 * @apiName DeleteRole
 * @apiGroup Role
 *
 * @apiParam {String} id Role id
 *
 * @apiSuccessExample Success-Response
 *     HTTP/1.1 204 No Content
 *
 *  @apiUse NotFoundError
 *  @apiUse ValidationError
 */

/**
 * @api {get} /access/users/:username/roles Get user roles
 * @apiName GetUserRoles
 * @apiGroup Role User
 *
 * @apiParam {String} username Username
 * @apiParam {String} [service] Service id
 * @apiParam {String} [company] Company id
 *
 * @apiSuccessExample Success-Response
 *     HTTP/1.1 200 OK
 *     [
 *        {
 *            "_id": "5774d238efb2f0535997eec6"
 *            "name": "Sales Manager",
 *            "service": "wlp",
 *            "company": "company-1"
 *        },
 *        {
 *            "_id": "5774d238efb2f0535997eec7"
 *            "name": "Admin",
 *            "service": "wlp",
 *            "company": "m800"
 *        }
 *     ]
 *
 *  @apiUse NotFoundError
 *  @apiUse ValidationError
 */


/**
 * @api {get} /access/users/:username/permissions Get user permissions
 * @apiName GetUserPermissions
 * @apiGroup Role User
 *
 * @apiParam {String} username Username
 * @apiParam {String} [service] Service id
 * @apiParam {String} [company] Company id
 *
 * @apiSuccessExample Success-Response
 *     HTTP/1.1 200 OK
 *     {
 *       "resource1": ["read"],
 *       "resource2": ["create", "read", "update", "delete"]
 *     }
 *
 *  @apiUse NotFoundError
 *  @apiUse ValidationError
 */

 /**
  * @api {put} /access/users/:username/roles Update user roles
  * @apiName PutUserRoles
  * @apiGroup Role User
  *
  * @apiParam {String} username Username
  * @apiParam {Object[]} body the role Object in the request body
  *
  * @apiSuccessExample {json} Request-Example
  *    [{"id": "57d124ffedd15d073b4f100d"}]
  *
  *  @apiUse NotFoundError
  *  @apiUse ValidationError
  */
