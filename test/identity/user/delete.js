import { describe, it } from 'mocha';
import { expect } from 'chai';

import getAgent from '../../getAgent';
import User from '../../../src/collections/user';

describe('DELETE /identity/users/:id', () => {
  let agent;
  before((done) => {
    getAgent().then(mAgent => {
      agent = mAgent;
      done();
    });
  });

  describe('delete the company', () => {
    // insert the data first
    before((done) => {
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
      User.create(userInfo, done);
    });

    // remove all the data
    after((done) => User.remove({}, done));

    it('successfully deletes the user record', (done) => {
      const id = 'user@test.abc';
      agent.delete(`/identity/users/${id}`)
           .expect(204)
           .end(() => {
             // check the mongo and expect no more record
             User.findOne({ _id: id }).then((user) => {
               expect(user).to.equal(null);
               done();
             });
           });
    });

    it('successfully deletes the non-existing company record', (done) => {
      agent.delete('/identity/users/notExist@sample.org')
           .expect(404)
           .end(done);
    });
  });
});
