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
 * @api {post} /access/roles Create role
 * @apiName CreateRole
 * @apiGroup Role
 *
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
 * @api {put} /access/roles/:id/permissions Set role permissions
 * @apiName SetRolePermissions
 * @apiGroup Role
 *
 * @apiParamExample {json} Request-Example
 * {
 *     "resource1": ["read"],
 *     "resource2": ["create", "read", "update", "delete"]
 * }
 *
 * @apiSuccessExample Success-Response
 *     HTTP/1.1 200 OK
 *     {
 *         "resource1": ["read"],",
 *         "resource2": ["create", "read", "update", "delete"]
 *     }
 *
 *  @apiUse NotFoundError
 *  @apiUse ValidationError
 */


/**
 * @api {get} /access/roles/:id/permissions Get role permissions
 * @apiName GetRolePermissions
 * @apiGroup Role
 *
 * @apiParam {String} id Role id
 *
 * @apiSuccessExample Success-Response
 *     HTTP/1.1 200 OK
 *     {
 *         "resource1": ["read"],
 *         "resource2": ["create", "read", "update", "delete"]
 *     }
 *
 *  @apiUse NotFoundError
 *  @apiUse ValidationError
 */


/**
 * @api {post} /access/roles/:id/users Assign user to role
 * @apiName AssignUserToRole
 * @apiGroup Role
 *
 * @apiParam {String} username Username
 * @apiParam {String} roleId Role id
 *
 * @apiParamExample {json} Request-Example
 * {
 *    "username": "johndoe@email.com"
 * }
 *
 * @apiSuccessExample Success-Response
 *     HTTP/1.1 200 OK
 *     {
 *         "username": "johndoe@email.com",
 *         "roleId": "5774d238efb2f0535997eec6"
 *     }
 *
 *  @apiUse NotFoundError
 *  @apiUse ValidationError
 */

/**
 * @api {delete} /access/roles/:id/users/:username Remove user from role
 * @apiName RemoveUserFromRole
 * @apiGroup Role
 *
 * @apiParam {String} username Username
 * @apiParam {String} roleId Role id
 *
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
 * @apiGroup User
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
 * @api {get} /access/users/:username/permissions Get user permissions
 * @apiName GetUserPermissions
 * @apiGroup User
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
