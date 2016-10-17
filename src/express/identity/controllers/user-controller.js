import _ from 'lodash';
import wrap from 'co-express';
import { Router } from 'express';

export function userController(userService) {
  const router = new Router();

  function getUserUrl(id, req) {
    return `${req.protocol}://${req.get('host')}/identity/users/${encodeURIComponent(id)}`;
  }

  function* postUser(req, res, next) {
    try {
      const { id } = yield userService.createUser(req.body);
      res.status(201);
      res.set('Location', getUserUrl(id, req));
      res.json({ id });
    } catch (e) {
      next(e);
    }
  }

  function* getUser(req, res, next) {
    try {
      const query = _.extend({}, req.params, req.query);
      const user = yield userService.getUser(query);
      res.status(200);
      res.json(user);
    } catch (e) {
      next(e);
    }
  }

  function* getUsers(req, res, next) {
    try {
      const { total, pageTotal, page, pageSize, users } = yield userService.getUsers(req.query);
      const result = {
        total,
        pageTotal,
        pageSize,
        page,
        items: users,
      };
      res.status(200);
      res.json(result);
    } catch (e) {
      next(e);
    }
  }

  function* putUser(req, res, next) {
    try {
      const command = _.extend({}, req.body, req.params);
      const user = yield userService.setUserInfo(command);
      // update information will return 204
      if (!user) {
        res.sendStatus(204);
        return;
      }
      // create a new user
      res.status(201);
      res.set('Location', getUserUrl(user.id, req));
      res.json({ id: user.id });
    } catch (e) {
      next(e);
    }
  }

  function* deleteUser(req, res, next) {
    try {
      yield userService.deleteUser(req.params);
      res.sendStatus(204);
    } catch (e) {
      next(e);
    }
  }

  function* patchUser(req, res, next) {
    try {
      const command = {
        id: req.params.id,
        patches: req.body,
      };
      const user = yield userService.patchUserInfo(command);
      // update information will return 204
      if (!user) {
        res.sendStatus(204);
        return;
      }
      // create a new user
      res.status(201);
      res.set('Location', getUserUrl(user.id, req));
      res.json({ id: user.id });
    } catch (e) {
      next(e);
    }
  }

  function* requestSetPassword(req, res, next) {
    try {
      const query = _.extend({}, req.params, req.body);
      yield userService.requestSetPassword(query);
      res.sendStatus(204);
    } catch (e) {
      next(e);
    }
  }

  router.post('/users', wrap(postUser));
  router.post('/users/:id/requestSetPassword', wrap(requestSetPassword));
  router.get('/users', wrap(getUsers));
  router.get('/users/:id', wrap(getUser));
  router.delete('/users/:id', wrap(deleteUser));
  router.patch('/users/:id', wrap(patchUser));
  router.put('/users/:id', wrap(putUser));

  return router;
}
