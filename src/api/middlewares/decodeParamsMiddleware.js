import _ from 'lodash';

export function createDecodeParamsMiddleware() {
  return (req, res, next) => {
    if (!req.params) {
      next();
    }

    _.forEach(req.params, (value, key) => {
      /* eslint no-param-reassign: ["error", { "props": false }]*/
      req.params[key] = decodeURIComponent(value);
    });
    next();
  };
}

export default createDecodeParamsMiddleware;
