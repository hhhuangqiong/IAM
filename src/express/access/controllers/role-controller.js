import wrap from 'co-express';
import * as _ from 'lodash';

import { check } from './../util';

export function roleController(imports) {
  check.members('imports', imports, [
    'router',
    'accessService',
  ]);

  const router = imports.router;
  const access = imports.accessService;

  function* getRoles(req, res, next) {
    try {
      const roles = yield access.getRoles(req.query);
      res.json(roles);
    } catch (e) {
      next(e);
    }
  }

  function* postRole(req, res, next) {
    try {
      const role = yield access.createRole(req.body);
      res.set('Location', `${req.protocol}://${req.get('host')}/access/roles/${role._id}`);
      res.status(201);
      res.json(role);
    } catch (e) {
      next(e);
    }
  }

  function* deleteRole(req, res, next) {
    try {
      yield access.deleteRole(req.params);
      res.sendStatus(204);
    } catch (e) {
      next(e);
    }
  }

  function* getRolePermissions(req, res, next) {
    try {
      const permissions = yield access.getRolePermissions(req.params);
      res.json(permissions);
    } catch (e) {
      next(e);
    }
  }

  function* setRolePermissions(req, res, next) {
    try {
      const command = {
        roleId: req.params.roleId,
        permissions: req.body,
      };
      const permissions = yield access.setRolePermissions(command);
      res.json(permissions);
    } catch (e) {
      next(e);
    }
  }

  function* assignRoleToUser(req, res, next) {
    try {
      const command = _.extend({}, req.body, req.params);
      const assignment = yield access.assignRole(command);
      res.json(assignment);
    } catch (e) {
      next(e);
    }
  }

  function* revokeRoleFromUser(req, res, next) {
    try {
      yield access.revokeRole(req.params);
      res.sendStatus(204);
    } catch (e) {
      next(e);
    }
  }

  router.post('/roles', wrap(postRole));
  router.get('/roles', wrap(getRoles));
  router.delete('/roles/:roleId', wrap(deleteRole));
  router.get('/roles/:roleId/permissions', wrap(getRolePermissions));
  router.put('/roles/:roleId/permissions', wrap(setRolePermissions));
  router.post('/roles/:roleId/users', wrap(assignRoleToUser));
  router.delete('/roles/:roleId/users/:username', wrap(revokeRoleFromUser));
}
