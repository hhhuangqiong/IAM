import { check } from './../util';
import { expressError } from '../../../utils/errorHelper';

export function errorHandler(imports, options) {
  check.members('import', imports, [
    'router',
    'logger',
  ]);
  check.members('options', options, [
    'env',
  ]);

  const { router } = imports;

  function handleErrors(err, req, res, next) {
    // TODO: move error handling to a single place for the whole application
    // logger.error(err);
    expressError(err, req, res, next);
  }

  router.use(handleErrors);
}
