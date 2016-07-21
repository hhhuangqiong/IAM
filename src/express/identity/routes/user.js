import isUndefined from 'lodash/isUndefined';
import { ArgumentNullError } from 'common-errors';
import Q from 'q';

import UserController from '../controllers/user';
import { expressError } from '../../../utils/errorHelper';
import { formatGetAllResult } from '../utils/helper';

const userController = new UserController();

function getUserUrl(username, req) {
  return `${req.protocol}://${req.get('host')}/identity/users/${username}`;
}

function updateOrInsert(user, req, res) {
  // updated the data
  if (!user) {
    res.status(204).end();
    return;
  }
  // create new company
  res.status(201)
     .set('Location', getUserUrl(user.username, req))
     .json({ username: user.username });
}

export function getAll(req, res) {
  const allParam = req.locals.input;
  const promiseArray = [];

  // get the resources
  promiseArray.push(userController.getAll(allParam.query, {
    pageNo: allParam.pageNo,
    pageSize: allParam.pageSize,
  }, allParam.sort));

  // get the total count
  promiseArray.push(userController.getTotal(allParam.query));

  // format the result data
  Q.all(promiseArray)
    .then(resultArray => {
      const [users, count] = resultArray;
      const result = formatGetAllResult(allParam, count,
        users.map((user) => user.toJSON()));
      res.status(200).json(result);
    })
    .catch(err => expressError(err, req, res))
    .done();
}

export function get(req, res) {
  userController.get(req.params.username)
    .then((user) => res.status(200).json(user))
    .catch(err => expressError(err, req, res))
    .done();
}

export function create(req, res) {
  userController.create(req.locals.input.data, req.locals.input.user)
    .then((user) => {
      res.status(201)
         .set('Location', getUserUrl(user.username, req))
         .json({ username: user.username });
    })
    .catch(err => expressError(err, req, res))
    .done();
}

export function validateRequired(req, res, next) {
  // missing username which is username
  if (isUndefined(req.body.username) && isUndefined(req.params.username)) {
    expressError(new ArgumentNullError('username'), req, res);
    return;
  }
  next();
}

export function patch(req, res) {
  userController.patch(req.params.username, req.body, req.user)
    .then((user) => updateOrInsert(user, req, res))
    .catch(err => expressError(err, req, res))
    .done();
}

export function replace(req, res) {
  const param = req.locals.input.data;
  param.username = req.params.username;
  userController.replace(req.params.username, param, req.locals.input.user)
    .then((user) => updateOrInsert(user, req, res))
    .catch(err => expressError(err, req, res))
    .done();
}

export function remove(req, res) {
  userController.remove(req.params.username)
    .then(() => res.status(204).end())
    .catch(err => expressError(err, req, res))
    .done();
}
