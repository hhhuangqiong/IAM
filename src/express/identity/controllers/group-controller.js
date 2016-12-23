import { Router } from 'express';
import { check } from 'm800-util';
import joinUrl from 'url-join';
import wrap from 'co-express';

export function groupController(groupService) {
  check.ok('groupService', groupService);

  function* listGroups(req, res, next) {
    try {
      const groupsPage = yield groupService.listGroups(req.query);
      res.json(groupsPage);
    } catch (e) {
      next(e);
    }
  }

  function* listGroupUsers(req, res, next) {
    try {
      const users = yield groupService.listGroupUsers(req.params);
      res.json(users);
    } catch (e) {
      next(e);
    }
  }

  function* getGroup(req, res, next) {
    try {
      const group = yield groupService.getGroup({
        ...req.query,
        ...req.params,
      });
      res.json(group);
    } catch (e) {
      next(e);
    }
  }

  function* createGroup(req, res, next) {
    try {
      const group = yield groupService.createGroup(req.body);
      const location = joinUrl(req.originalUrl, group.id.toString());
      res.location(location)
        .status(201)
        .json(group);
    } catch (e) {
      next(e);
    }
  }

  function* updateGroup(req, res, next) {
    try {
      const group = yield groupService.updateGroup({
        ...req.body,
        ...req.params,
      });
      res.json(group);
    } catch (e) {
      next(e);
    }
  }

  function* removeGroup(req, res, next) {
    try {
      yield groupService.removeGroup(req.params);
      res.sendStatus(204);
    } catch (e) {
      next(e);
    }
  }

  const router = new Router();
  router.get('/groups', wrap(listGroups));
  router.get('/groups/:groupId/users', wrap(listGroupUsers));
  router.get('/groups/:groupId', wrap(getGroup));
  router.post('/groups', wrap(createGroup));
  router.put('/groups/:groupId', wrap(updateGroup));
  router.delete('/groups/:groupId', wrap(removeGroup));
  return router;
}

export default groupController;
