import { Router } from 'express';
import { createEngine } from 'express-react-views';
import path from 'path';
import cookies from 'cookies';

import { SIGN_COOKIES_KEY } from '../../constants/cookiesKey';
import { provider } from '../../koa/openid/provider';

export function injectOpenIdRoutes(server, { urlencodedParser }) {
  const router = new Router();

  router.post('/login', urlencodedParser, (req, res, next) => {
    if (!req.body.id || !req.body.password || !req.body.grant) {
      res.status(422).end();
      return;
    }
    provider.get('Account').findByLogin(req.body.id, req.body.password).then(account => {
      const result = {
        login: {
          account: account.accountId,
          acr: 1,
          ts: Date.now() / 1000 | 0,
          remember: !!req.body.remember,
        },
      };
      provider.resume(res, req.body.grant, result);
    })
   // @TODO show a error page rather than error code
   .catch(e => {
     next(e);
   })
   .done();
  });

  router.get('/interaction/:grant', (req, res) => {
    const grant = req.cookies.get('_grant', { signed: true });

    if (!grant) {
      res.status(500).end();
      return;
    }

    const grantData = JSON.parse(grant).params;
    const client = provider.get('Client').find(grantData.client_id);

    res.render('signIn', {
      grant: req.params.grant,
      client,
      request: grantData,
    });
  });

  // set the view engine
  server.set('views', path.resolve(__dirname, '../views'));
  server.set('view engine', 'js');
  server.engine('js', createEngine());
  server.use('/openid', cookies.express(SIGN_COOKIES_KEY), router);
}
