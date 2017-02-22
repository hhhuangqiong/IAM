import _ from 'lodash';
import { check } from 'm800-util';
import { decorateController } from './controllerUtil';

export function roleController(accessService) {
  check.ok('accessService', accessService);

  async function getRoles(req, res) {
    const roles = await accessService.getRoles(req.query);
    res.json(roles);
  }

  async function postRole(req, res) {
    const role = await accessService.createRole(req.body);
    res.set('Location', `${req.protocol}://${req.get('host')}/access/roles/${role._id}`);
    res.status(201);
    res.json(role);
  }

  async function deleteRole(req, res) {
    await accessService.deleteRole(req.params);
    res.sendStatus(204);
  }

  async function updateRole(req, res) {
    const command = _.extend({}, req.body, req.params);
    const result = await accessService.updateRole(command);
    res.json(result);
  }

  return decorateController({
    postRole,
    getRoles,
    deleteRole,
    updateRole,
  });
}

export default roleController;
