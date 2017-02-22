import { describe, it } from 'mocha';
import { expect } from 'chai';

import getTestContext from '../../testContext';

describe('DELETE /identity/users/:id', () => {
  let agent;
  let User;
  before(() =>
    getTestContext().then(({ agent: mAgent, models }) => {
      agent = mAgent;
      User = models.User;
    }));

  describe('delete the user', () => {
    // insert the data first
    before(() => {
      const userInfo = {
        id: 'user@test.abc',
        name: {
          formatted: 'Johnny M. Richmond',
          familyName: 'Richmond',
          givenName: 'Johnny',
          middleName: 'M',
        },
        nickName: 'Johnny R',
      };
      return User.create(userInfo);
    });

    // remove all the data
    after(() => User.remove({}));

    it('successfully deletes the user record', (done) => {
      const id = 'user@test.abc';
      agent.delete(`/identity/users/${encodeURIComponent(id)}`)
           .expect(204)
           .end(() => {
             // check the mongo and expect no more record
             User.findOne({ _id: id }).then((user) => {
               expect(user).to.equal(null);
               done();
             });
           });
    });

    it('successfully deletes the non-existing user record', (done) => {
      agent.delete(`/identity/users/${encodeURIComponent('notExist@sample.org')}`)
           .expect(404)
           .end(done);
    });
  });

  describe('delete the root user', () => {
    // insert the data first
    before(() => {
      const userInfo = {
        isRoot: true,
        id: 'root@abc.com',
      };
      return User.create(userInfo);
    });

    // remove all the data
    after(() => User.remove({}));

    it('fail to delete the root user record', (done) => {
      agent.delete(`/identity/users/${encodeURIComponent('root@abc.com')}`)
           .expect(403)
           .end(done);
    });
  });
});
