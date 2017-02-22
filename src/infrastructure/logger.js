import winston from 'winston';
import _ from 'lodash';
import { check } from 'm800-util';

const CUSTOM_LEVELS = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3,
    trace: 4,
  },
  colors: {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    debug: 'blue',
    trace: 'magenta',
  },
};

export function createLogger(env, logLevel = 'debug') {
  check.ok('env', env);
  check.predicate('logLevel', logLevel, x => _.has(CUSTOM_LEVELS.levels, x),
   'Param must be valid log level');

  const logger = new (winston.Logger)({
    levels: CUSTOM_LEVELS.levels,
    colors: CUSTOM_LEVELS.colors,
    level: logLevel,
    transports: [
      new winston.transports.Console({
        colorize: env === 'development',
        timestamp: true,
      }),
    ],
  });
  return logger;
}

export default createLogger;
