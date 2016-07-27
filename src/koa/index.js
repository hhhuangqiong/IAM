import { provider, setUp } from './openid/provider';

const OPENID_PREFIX = '/openid';

function getKoaApp() {
  // provider.app is koa app
  const app = provider.app;
  // set up the open id provider
  return setUp().then(() => app);
}

export default function injectKoa(server) {
  // mount the koa on top of the express
  return getKoaApp().then(app => {
    server.use(OPENID_PREFIX, app.callback());
    return server;
  });
}
