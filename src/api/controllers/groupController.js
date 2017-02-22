import { check } from 'm800-util';
import joinUrl from 'url-join';

import { decorateController } from './controllerUtil';

export function groupController(groupService) {
  check.ok('groupService', groupService);

  async function listGroups(req, res) {
    const groupsPage = await groupService.listGroups(req.query);
    res.json(groupsPage);
  }

  async function listGroupUsers(req, res) {
    const users = await groupService.listGroupUsers(req.params);
    res.json(users);
  }

  async function getGroup(req, res) {
    const group = await groupService.getGroup({
      ...req.query,
      ...req.params,
    });
    res.json(group);
  }

  async function createGroup(req, res) {
    const group = await groupService.createGroup(req.body);
    const location = joinUrl(req.originalUrl, group.id.toString());
    res.location(location)
      .status(201)
      .json(group);
  }

  async function updateGroup(req, res) {
    const group = await groupService.updateGroup({
      ...req.body,
      ...req.params,
    });
    res.json(group);
  }

  async function removeGroup(req, res) {
    await groupService.removeGroup(req.params);
    res.sendStatus(204);
  }

  return decorateController({
    listGroups,
    listGroupUsers,
    getGroup,
    createGroup,
    updateGroup,
    removeGroup,
  });
}

export default groupController;
