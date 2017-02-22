import _ from 'lodash';
import { check } from 'm800-util';
import { decorateController } from './controllerUtil';

export function userRoleController(accessService) {
  check.ok('accessService', accessService);

  async function getUserRoles(req, res) {
    const query = _.extend({}, req.params, req.query);
    const roles = await accessService.getRoles(query);
    res.json(roles);
  }

  async function setUserRoles(req, res) {
    const command = _.extend({}, req.params, req.query,
      { roles: req.body });
    const roles = await accessService.updateUserRoles(command);
    res.json(roles);
  }

  async function getUserPermissions(req, res) {
    const query = _.extend({}, req.params, req.query);
    const permissions = await accessService.getUserPermissions(query);
    res.json(permissions);
  }

  return decorateController({
    getUserRoles,
    setUserRoles,
    getUserPermissions,
  });
}

export default userRoleController;
