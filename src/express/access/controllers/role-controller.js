import wrap from 'co-express';
import * as _ from 'lodash';
import { Router } from 'express';

export function roleController(access) {
  const router = new Router();

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

  function* updateRole(req, res, next) {
    try {
      const command = _.extend({}, req.body, req.params);
      const result = yield access.updateRole(command);
      res.json(result);
    } catch (e) {
      next(e);
    }
  }

  router.post('/roles', wrap(postRole));
  router.get('/roles', wrap(getRoles));
  router.delete('/roles/:roleId', wrap(deleteRole));
  router.put('/roles/:roleId', wrap(updateRole));

  return router;
}
