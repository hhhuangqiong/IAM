import { ArgumentNullError, NotFoundError, ValidationError } from 'common-errors';

const OPENID_ERROR = {
  [ArgumentNullError.name]: 20001,
  [NotFoundError.name]: 20001,
  [ValidationError.name]: 20004,
  DEFAULT: 20000,
};

export default {
  OPENID_ERROR,
};
