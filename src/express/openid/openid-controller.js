import { Router } from 'express';
import wrap from 'co-express';

export function openIdController(getProvider) {
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
    const provider = yield getProvider;
    const grantData = JSON.parse(grant).params;
    const client = provider.get('Client').find(grantData.client_id);

    res.render('signIn', {
      grant: req.params.grant,
      client,
      request: grantData,
    });
  }

  router.post('/login', wrap(login));
  router.get('/interaction/:grant', wrap(loginInteraction));
  return router;
}
