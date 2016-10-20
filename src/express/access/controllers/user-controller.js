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

  function* setUserRoles(req, res, next) {
    try {
      const command = _.extend({}, req.params, req.query,
        { roles: req.body });
      const roles = yield access.updateUserRoles(command);
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
  router.put('/users/:username/roles', wrap(setUserRoles));
  router.get('/users/:username/permissions', wrap(getUserPermissions));

  return router;
}
