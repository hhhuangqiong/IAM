import { createMongooseConnection } from './mongo';
import { createLogger } from './logger';

export * from './logger';
export { createMongooseConnection } from './mongo';

export function register(container) {
  container.service('logger', createLogger, 'ENV', 'logLevel');
  container.service('mongooseConnection', createMongooseConnection, 'logger', 'mongoOptions');
  container.factory('mongoConnection', ({ mongooseConnection }) => mongooseConnection.db);
  return container;
}

export default register;
