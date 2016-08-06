import { Router } from 'express';
import wrap from 'co-express';
import _ from 'lodash';
import bodyParser from 'body-parser';

const jsonParser = bodyParser.json();
const urlencodedParser = bodyParser.urlencoded({
  extended: true,
});

export function openIdController(getProvider, userService) {
  const router = new Router();

  function* login(req, res, next) {
    if (!req.body.id || !req.body.password || !req.body.grant) {
      res.sendStatus(422);
      return;
    }
    const provider = yield getProvider;
    try {
      const account = yield provider.get('Account').findByLogin(req.body.id, req.body.password);
      const result = {
        login: {
          account: account.accountId,
          acr: 1,
          ts: Date.now() / 1000 | 0,
          remember: !!req.body.remember,
        },
      };
      provider.resume(res, req.body.grant, result);
    } catch (ex) {
      next(ex);
    }
  }

  function* loginInteraction(req, res) {
    const grant = req.cookies.get('_grant', { signed: true });
    if (!grant) {
      res.status(500).end();
      return;
    }
    const grantData = JSON.parse(grant);
    res.render('signIn', {
      grant: req.params.grant,
      clientId: grantData.params.client_id,
      redirectURL: grantData.params.redirect_uri,
      details: grantData.details,
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
      // redirect to the redirect url
      if (command.redirectURL) {
        res.redirect(decodeURIComponent(command.redirectURL));
        return;
      }
      // @TODO if no redirect url mention, may refer to the IAM index page
      res.sendStatus(204);
    } catch (e) {
      next(e);
    }
  }

  function resetPasswordPage(req, res) {
    res.render('resetPassword');
  }

  function setPasswordPage(req, res) {
    res.render('setPassword');
  }

  router.post('/login', jsonParser, urlencodedParser, wrap(login));
  router.get('/interaction/:grant', wrap(loginInteraction));

  router.get('/resetPassword', resetPasswordPage);
  router.get('/setPassword', setPasswordPage);

  router.post('/resetPassword', jsonParser, urlencodedParser, wrap(requestResetPassword));
  router.post('/setPassword', jsonParser, urlencodedParser, wrap(setPassword));

  return router;
}
