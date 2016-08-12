import co from 'co';
import { getContainer } from '../../utils/ioc';

export default class Account {
  constructor(accountId, profile) {
    this.accountId = accountId;
    this.profile = profile;
    return this;
  }
  claims() {
    // sub is the end user identifier
    this.profile.sub = this.accountId;
    return this.profile;
  }
  // find the login by id password
  static findByLogin(id, password) {
    const { userService } = getContainer();
    const wrappedVerifyPassword = co.wrap(userService.verifyPassword);
    return wrappedVerifyPassword.call(userService, { id, password })
     .then(() => this.findById(id));
  }

  static findById(id) {
    const { userService } = getContainer();
    const wrappedGetUser = co.wrap(userService.getUser);
    return wrappedGetUser.call(userService, { id })
     .then((profile) => new Account(id, profile));
  }
}
