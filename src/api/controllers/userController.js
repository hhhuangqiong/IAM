import _ from 'lodash';
import { check } from 'm800-util';
import { decorateController } from './controllerUtil';

export function userController(userService) {
  check.ok('userService', userService);

  function getUserUrl(id, req) {
    return `${req.protocol}://${req.get('host')}/identity/users/${encodeURIComponent(id)}`;
  }

  async function postUser(req, res) {
    const { id } = await userService.createUser(req.body);
    res.status(201);
    res.set('Location', getUserUrl(id, req));
    res.json({ id });
  }

  async function getUser(req, res) {
    const query = _.extend({}, req.params, req.query);
    const user = await userService.getUser(query);
    res.status(200);
    res.json(user);
  }

  async function getUsers(req, res) {
    const usersPage = await userService.getUsers(req.query);
    res.status(200);
    res.json(usersPage);
  }

  async function putUser(req, res) {
    const command = _.extend({}, req.body, req.params);
    const user = await userService.setUserInfo(command);
    res.json(user);
  }

  async function deleteUser(req, res) {
    await userService.deleteUser(req.params);
    res.sendStatus(204);
  }

  async function requestSetPassword(req, res) {
    const query = _.extend({}, req.params, req.body);
    await userService.requestSetPassword(query);
    res.sendStatus(204);
  }

  return decorateController({
    postUser,
    requestSetPassword,
    getUsers,
    getUser,
    deleteUser,
    putUser,
  });
}

export default userController;
