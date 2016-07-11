import { provider } from './openid';

const OPENID_PREFIX = '/openid';

export default function injectKoa(server) {
  // mount the koa on top of the express
  server.use(OPENID_PREFIX, provider.app.callback());
  return server;
}
