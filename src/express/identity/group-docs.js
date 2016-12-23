/**
 * @apiDefine ValidationError
 * @apiError Validation Request validation failed
 *
 * @apiErrorExample Validation Error (example)
 * HTTP/1.1 422 Unprocessable Entity
 * {
 *   "message": "Request entity is invalid.",
 *   "type": "Validation",
 *   "details": [
 *      {
 *        "field": "fieldName",
 *        "type": "string.required",
 *        "message": "Field name is required"
 *      }
 *   ]
 * }
 *
 */

/**
 * @apiDefine NotFoundError
 * @apiError NotFound Primary or related resource was not found
 *
 * @apiErrorExample Not Found Error (example)
 * HTTP/1.1 404 Not Found
 * {
 *   "message": "Primary or related resource was not found. Resource key: [id]",
 *   "type": "NotFound"
 * }
 */

/**
 * @apiDefine group
 * @apiParam {String} service Service id
 * @apiParam {String} company Company id
 * @apiParam {String} name Group name
 * @apiParam {String[]} users Member user emails
 */

/**
 * @api {post} /identity/groups Create group
 * @apiName CreateGroup
 * @apiUse group
 * @apiGroup Group
 * @apiParamExample {json} Request-Example
 * {
 * 	"name": "notification-receivers.topup",
 * 	"service": "wlp",
 * 	"company": "586124a63c5d010a8494fb3d",
 * 	"users": [
 * 		"shawn.kulas@cwg.com"
 * 	]
 * }
 *
 *
 * @apiSuccessExample Success-Response
 * HTTP/1.1 201 Created
 * {
 *   "createdAt": "2016-12-26T14:25:37.553Z",
 *   "updatedAt": "2016-12-26T14:25:37.553Z",
 *   "name": "notification-receivers.topup",
 *   "service": "wlp",
 *   "company": "586124a63c5d010a8494fb3d",
 *   "id": "5861286154e4a314f85af0cf",
 *   "users": [
 *     "shawn.kulas@cwg.com"
 *   ]
 * }
 *
 *  @apiUse NotFoundError
 *  @apiUse ValidationError
 */

/**
 * @api {put} /identity/groups/:groupId Update group
 * @apiName UpdateGroup
 * @apiUse group
 * @apiGroup Group
 * @apiParamExample {json} Request-Example
 * {
 * 	"name": "notification-receivers.topup",
 * 	"service": "wlp",
 * 	"company": "586124a63c5d010a8494fb3d",
 * 	"users": [
 * 		"shawn.kulas@cwg.com"
 * 	]
 * }
 *
 * @apiSuccessExample Success-Response
 * HTTP/1.1 200 OK
 * {
 *   "createdAt": "2016-12-26T14:25:37.553Z",
 *   "updatedAt": "2016-12-27T15:38:37.553Z",
 *   "name": "notification-receivers.topup",
 *   "service": "wlp",
 *   "company": "586124a63c5d010a8494fb3d",
 *   "id": "5861286154e4a314f85af0cf",
 *   "users": [
 *     "shawn.kulas@cwg.com"
 *   ]
 * }
 *
 *  @apiUse NotFoundError
 *  @apiUse ValidationError
 */

/**
 * @api {get} /identity/groups Get groups
 * @apiName GetGroups
 * @apiGroup Group
 *
 * @apiParam {String} [service] Service id filter
 * @apiParam {String} [company] Company id filter
 * @apiParam {String} [name] Name filter (name starts with)
 *
 * @apiSuccessExample Success-Response
 * HTTP/1.1 200 OK
 * {
 *  "total": 3,
 *  "pageTotal": 1,
 *  "page": 1,
 *  "pageSize": 20,
 *  "items": [
 *    {
 *      "id": "586124a63c5d010a8494fb3e",
 *      "name": "cwg-group-1",
 *      "company": "586124a63c5d010a8494fb3d",
 *      "service": "wlp",
 *      "createdAt": "2016-12-26T14:09:42.866Z",
 *      "updatedAt": "2016-12-26T14:09:42.866Z",
 *      "users": [
 *        "porter.bergstrom@cwg.com",
 *        "shawn.kulas@cwg.com"
 *      ]
 *    },
 *    {
 *      "id": "586124a63c5d010a8494fb3f",
 *      "name": "cwg-group-2",
 *      "company": "586124a63c5d010a8494fb3d",
 *      "service": "wlp",
 *      "createdAt": "2016-12-26T14:09:42.866Z",
 *      "updatedAt": "2016-12-26T14:09:42.866Z",
 *      "users": [
 *        "jettie.hahn@cwg.com",
 *        "shanie.okuneva@cwg.com"
 *      ]
 *    },
 *    {
 *      "id": "5861286154e4a314f85af0cf",
 *      "createdAt": "2016-12-26T14:25:37.553Z",
 *      "updatedAt": "2016-12-26T14:25:37.553Z",
 *      "name": "notifications-topup-2",
 *      "service": "wlp",
 *      "company": "586124a63c5d010a8494fb3d",
 *      "users": [
 *        "shawn.kulas@cwg.com"
 *      ]
 *    }
 *  ]
 * }
 *
 *  @apiUse ValidationError
 */


/**
 * @api {get} /identity/groups/:groupId Get group
 * @apiName GetGroup
 * @apiGroup Group
 *
 * @apiParam {String} groupId Group id
 * @apiParam {Boolean} users Expand users (include additional user data for each user)
 *
 * @apiSuccessExample Success-Response
 * HTTP/1.1 200 OK
 * {
 *   "id": "586124a63c5d010a8494fb3e",
 *   "name": "cwg-group-1",
 *   "company": "586124a63c5d010a8494fb3d",
 *   "service": "wlp",
 *   "createdAt": "2016-12-26T14:09:42.866Z",
 *   "updatedAt": "2016-12-26T14:09:42.866Z",
 *   "users": [
 *     {
 *       "displayName": "Porter Bergstrom",
 *       "affiliatedCompany": "586124a63c5d010a8494fb3d",
 *       "createdAt": "2016-12-26T14:09:42.863Z",
 *       "updatedAt": "2016-12-26T14:09:42.863Z",
 *       "active": true,
 *       "name": {
 *         "givenName": "Porter",
 *         "familyName": "Bergstrom"
 *       },
 *       "isRoot": false,
 *       "id": "porter.bergstrom@cwg.com"
 *     },
 *     {
 *       "displayName": "Shawn Kulas",
 *       "affiliatedCompany": "586124a63c5d010a8494fb3d",
 *       "createdAt": "2016-12-26T14:09:42.863Z",
 *       "updatedAt": "2016-12-26T14:09:42.863Z",
 *       "active": true,
 *       "name": {
 *         "givenName": "Shawn",
 *         "familyName": "Kulas"
 *       },
 *       "isRoot": false,
 *       "id": "shawn.kulas@cwg.com"
 *     }
 *   ]
 * }
 *
 *  @apiUse NotFoundError
 *  @apiUse ValidationError
 */


/**
 * @api {delete} /access/groups/:groupId Delete group
 * @apiName DeleteGroup
 * @apiGroup Group
 *
 * @apiParam {String} groupId GroupId
 *
 * @apiSuccessExample Success-Response
 * HTTP/1.1 204 No Content
 */
