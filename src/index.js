import { create } from './app';
import config from './config';
import { createLogger } from './infrastructure';

async function run() {
  const logger = createLogger(process.env.NODE_ENV || 'development');
  try {
    const app = create(config);
    const { server, openIdProvider } = app;
    await openIdProvider.registerClient();
    server.start();

    process.on('SIGINT', async () => {
      const { mongooseConnection } = app;
      await mongooseConnection.close();
      process.exit(0);
    });
  } catch (ex) {
    logger.error('Fail to start the service %s', ex.message, ex);
  }
}

run();
