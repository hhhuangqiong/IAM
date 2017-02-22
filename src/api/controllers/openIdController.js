import _ from 'lodash';
import { check } from 'm800-util';
import { ArgumentNullError } from 'common-errors';
import url from 'url';
import querystring from 'querystring';
import { decorateController } from './controllerUtil';
import { enums } from '../../services/openId';

export function openIdController(openIdProvider, userService, logger, env) {
  check.ok('openIdProvider', openIdProvider);
  check.ok('userService', userService);
  check.ok('logger', logger);
  check.ok('env', env);

  const provider = openIdProvider.getProvider();

  function loginErrorHandler(req, res, error) {
    const code = enums.OPENID_ERROR[error.name] || enums.OPENID_ERROR.DEFAULT;

    // remove the previous error code and set the new one
    const { query, pathname } = url.parse(req.get('referer'));
    const queryObject = querystring.parse(query);
    queryObject.error = code;

    // refer back to previous page with the error code
    res.redirect(url.format({
      pathname,
      search: querystring.stringify(queryObject),
    }));
  }

  async function login(req, res) {
    check.members('req.body', req.body, ['id', 'password', 'grant', 'remember']);

    let account;
    try {
      account = await provider.get('Account').findByLogin(req.body.id, req.body.password);
    } catch (ex) {
      loginErrorHandler(req, res, ex);
      return;
    }
    const result = {
      login: {
        account: account.accountId,
        acr: 1,
        ts: Math.floor(Date.now() / 1000),
        remember: !!req.body.remember,
      },
    };
    provider.resume(res, req.body.grant, result);
  }

  async function viewLoginPage(req, res) {
    logger.trace('load the login interaction');
    const grant = req.cookies.get('_grant', { signed: true });
    logger.trace('got the grant data string', grant);
    // @TODO add error page on front end
    if (!grant) {
      throw new ArgumentNullError('no grant data from cookies');
    }
    const grantData = JSON.parse(grant);
    logger.trace('parsed the grant data', grantData);
    const appMeta = {
      locale: req.locale,
      grant: req.params.grant,
      clientId: grantData.params.client_id,
      redirectURL: grantData.params.redirect_uri,
      details: grantData.details,
    };
    // to read the error message if there is param and pass to render page
    if (req.query.error) {
      appMeta.error = req.query.error;
    }
    logger.trace('render the page with appMeta', appMeta);
    res.render('App', {
      page: 'login',
      appMeta,
      env,
    });
  }


  async function requestResetPassword(req, res) {
    const command = _.extend({}, req.body, req.query);
    await userService.requestResetPassword(command);
    res.sendStatus(204);
  }

  async function setPassword(req, res) {
    const command = _.extend({}, req.body, req.query);
    await userService.setPassword(_.pick(command, ['id', 'token', 'password', 'event']));
    res.sendStatus(204);
  }

  function resetPasswordPage(req, res) {
    const { clientId, redirectURL } = req.query;
    res.render('App', {
      page: 'resetPassword',
      appMeta: {
        locale: req.locale,
        clientId,
        redirectURL,
      },
      env,
    });
  }

  function setPasswordPage(req, res) {
    const { clientId, event, id, redirectURL, token } = req.query;
    res.render('App', {
      page: 'setPassword',
      appMeta: {
        locale: req.locale,
        clientId,
        event,
        id,
        redirectURL,
        token,
      },
      env,
    });
  }

  return {
    resetPasswordPage,
    setPasswordPage,
    ...decorateController({
      login,
      viewLoginPage,
      requestResetPassword,
      setPassword,
    }),
  };
}

export default openIdController;
