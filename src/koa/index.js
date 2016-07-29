import { getProvider } from './openid/provider';

export default function injectKoa(server) {
  // mount the koa on top of the express
  return getProvider().then(provider => {
    server.use('/openid/core', provider.app.callback());
    return server;
  });
}
