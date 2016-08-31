import { Router } from 'express';
import wrap from 'co-express';
import _ from 'lodash';
import bodyParser from 'body-parser';
import { NotFoundError, ValidationError, ArgumentNullError } from 'common-errors';

const jsonParser = bodyParser.json();
const urlencodedParser = bodyParser.urlencoded({
  extended: true,
});

function removeURLParameter(url, parameter) {
  const urlparts = url.split('?');
  if (urlparts.length >= 2) {
    const prefix = `${encodeURIComponent(parameter)}=`;
    const pars = urlparts[1].split(/[&;]/g);
    // reverse iteration as may be destructive
    for (let i = pars.length; i-- > 0;) {
      // idiom for string.startsWith
      if (pars[i].lastIndexOf(prefix, 0) !== -1) {
        pars.splice(i, 1);
      }
    }
    return urlparts[0] + (pars.length > 0 ? `?${pars.join('&')}` : '');
  }
  return url;
}

export function openIdController(getProvider, userService) {
  const router = new Router();

  function loginErrorHandler(req, res, error) {
    let code;
    switch (error.name) {
      case ArgumentNullError.name:
      case NotFoundError.name:
        code = 20001;
        break;
      case ValidationError.name:
        code = 20004;
        break;
      default:
        code = 20000;
        break;
    }
    // remove the previous error code
    const url = removeURLParameter(req.get('referer'), 'error');
    // refer back to previous page with the error code
    res.redirect(`${url}?error=${code}`);
  }
  function* login(req, res) {
    if (!req.body.id) {
      loginErrorHandler(req, res, new ArgumentNullError('id'));
      return;
    }
    if (!req.body.password) {
      loginErrorHandler(req, res, new ArgumentNullError('password'));
      return;
    }
    if (!req.body.grant) {
      loginErrorHandler(req, res, new ArgumentNullError('grant'));
      return;
    }

    const provider = yield getProvider;
    let account;
    try {
      account = yield provider.get('Account').findByLogin(req.body.id, req.body.password);
    } catch (ex) {
      loginErrorHandler(req, res, ex);
    }
    const result = {
      login: {
        account: account.accountId,
        acr: 1,
        ts: Date.now() / 1000 | 0,
        remember: !!req.body.remember,
      },
    };
    provider.resume(res, req.body.grant, result);
  }

  function* loginInteraction(req, res) {
    const grant = req.cookies.get('_grant', { signed: true });
    if (!grant) {
      res.status(500).end();
      return;
    }
    const grantData = JSON.parse(grant);
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
    res.render('App', {
      page: 'login',
      appMeta,
    });
  }


  function* requestResetPassword(req, res, next) {
    const command = _.extend({}, req.body, req.query);
    try {
      yield userService.requestResetPassword(command);
      res.sendStatus(204);
    } catch (e) {
      next(e);
    }
  }

  function* setPassword(req, res, next) {
    const command = _.extend({}, req.body, req.query);
    try {
      yield userService.setPassword(_.pick(command, ['id', 'token', 'password', 'event']));
      res.sendStatus(204);
    } catch (e) {
      next(e);
    }
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
    });
  }

  router.post('/login', jsonParser, urlencodedParser, wrap(login));
  router.get('/interaction/:grant', wrap(loginInteraction));

  router.get('/resetPassword', resetPasswordPage);
  router.get('/setPassword', setPasswordPage);

  router.post('/resetPassword', jsonParser, urlencodedParser, wrap(requestResetPassword));
  router.post('/setPassword', jsonParser, urlencodedParser, wrap(setPassword));

  return router;
}
