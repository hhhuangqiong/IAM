import { Router } from 'express';

export const router = new Router();

// @TODO sample API

/**
 * @api {get} /userRoles/:userId Request User roles
 * @apiName GetUserRoles
 * @apiGroup Access
 *
 * @apiParam {String} userId Users unique ID.
 *
 * @apiSuccess {String[]} roles the roles of user
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "roles" : ['user']
 *     }
 * @apiError UserNotFound The id of the User was not found.
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "error": "UserNotFound"
 *     }
 */
router.get('/userRoles/:userId', (req, res) => {
  res.json({
    roles: ['user'],
  });
});
