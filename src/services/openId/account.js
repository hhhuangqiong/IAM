export function createAccount(userService) {
  return class Account {
    constructor(accountId, profile) {
      this.accountId = accountId;
      this.profile = profile;
    }
    claims() {
      // sub is the end user identifier
      this.profile.sub = this.accountId;
      return this.profile;
    }
    // find the login by id password
    static async findByLogin(id, password) {
      await userService.verifyPassword({ id, password });
      return await this.findById(id);
    }

    static async findById(id) {
      const profile = await userService.getUser({ id });
      return new Account(id, profile);
    }
  };
}

export default createAccount;
