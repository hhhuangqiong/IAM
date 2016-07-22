import isUndefined from 'lodash/isUndefined';
import { ArgumentNullError } from 'common-errors';
import Q from 'q';

import UserController from '../controllers/user';
import { expressError } from '../../../utils/errorHelper';
import { formatGetAllResult } from '../utils/helper';

const userController = new UserController();

/**
 * get the user url to access the user data
 * @method getUserUrl
 * @param {String} username the username
 * @param {Object} req the express request object
 * @returns {String} the url
 */
function getUserUrl(username, req) {
  return `${req.protocol}://${req.get('host')}/identity/users/${username}`;
}

/**
 * Deteremine set the response status based on insert or update
 * @method updateOrInsert
 * @param {Object} user the userObject
 * @param {Object} req the express request object
 * @param {Object} res the express response object
 */
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

/**
 * get all the user
 * @method getAll
 * @param {Object} req the express request object
 * @param {Object} res the express response object
 */
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

/**
 * get user
 * @method create
 * @param {Object} req the express request object
 * @param {Object} res the express response object
 */
export function get(req, res) {
  userController.get(req.params.username)
    .then((user) => res.status(200).json(user))
    .catch(err => expressError(err, req, res))
    .done();
}

/**
 * create user
 * @method create
 * @param {Object} req the express request object
 * @param {Object} res the express response object
 */
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

/**
 * validate if the required field is mentioned
 * @method validateRequired
 * @param {Object} req the express request object
 * @param {Object} res the express response object
 * @param {Object} next the express next object
 * @throws {ArgumentNullError} Missing username
 */
export function validateRequired(req, res, next) {
  // missing username which is username
  if (isUndefined(req.body.username) && isUndefined(req.params.username)) {
    expressError(new ArgumentNullError('username'), req, res);
    return;
  }
  next();
}

/**
 * patch the user
 * @method patch
 * @param {Object} req the express request object
 * @param {Object} res the express response object
 */
export function patch(req, res) {
  userController.patch(req.params.username, req.body, req.user)
    .then((user) => updateOrInsert(user, req, res))
    .catch(err => expressError(err, req, res))
    .done();
}

/**
 * replace the user
 * @method replace
 * @param {Object} req the express request object
 * @param {Object} res the express response object
 */
export function replace(req, res) {
  const param = req.locals.input.data;
  param.username = req.params.username;
  userController.replace(req.params.username, param, req.locals.input.user)
    .then((user) => updateOrInsert(user, req, res))
    .catch(err => expressError(err, req, res))
    .done();
}

/**
 * remove the user
 * @method remove
 * @param {Object} req the express request object
 * @param {Object} res the express response object
 */
export function remove(req, res) {
  userController.remove(req.params.username)
    .then(() => res.status(204).end())
    .catch(err => expressError(err, req, res))
    .done();
}
