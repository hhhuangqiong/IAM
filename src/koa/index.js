import { getContainer } from '../utils/ioc';

export default function injectKoa(server) {
  // mount the koa on top of the express
  const { openIdProvider } = getContainer();
  return openIdProvider.then(provider => {
    server.use('/openid/core', provider.app.callback());
    return server;
  });
}
