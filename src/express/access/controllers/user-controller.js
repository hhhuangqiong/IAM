import wrap from 'co-express';
import * as _ from 'lodash';
import { Router } from 'express';

export function userController(access) {
  const router = new Router();

  function* getUserRoles(req, res, next) {
    try {
      const query = _.extend({}, req.params, req.query);
      const roles = yield access.getRoles(query);
      res.json(roles);
    } catch (e) {
      next(e);
    }
  }

  function* getUserPermissions(req, res, next) {
    try {
      const query = _.extend({}, req.params, req.query);
      const permissions = yield access.getUserPermissions(query);
      res.json(permissions);
    } catch (e) {
      next(e);
    }
  }

  router.get('/users/:username/roles', wrap(getUserRoles));
  router.get('/users/:username/permissions', wrap(getUserPermissions));

  return router;
}
