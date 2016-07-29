import { getContainer } from '../../utils/ioc';

export default class Account {
  constructor(accountId, profile) {
    this.userService = getContainer().userService;
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
    return this.userService.verifyPassword(id, password).then(() => this.findById(id));
  }

  static findById(id) {
    return this.userService.getUser(id).then((profile) => new Account(id, profile));
  }
}
