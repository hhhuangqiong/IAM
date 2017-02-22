import { describe, it } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';
import Promise from 'bluebird';

import getTestContext from '../../testContext';

describe('PUT /identity/users/:id', () => {
  let agent;
  let User;
  let emailService;
  before(() =>
    getTestContext().then(({ agent: mAgent, models, app }) => {
      agent = mAgent;
      User = models.User;
      emailService = app.EmailService;
    }));

  describe('replace the data', () => {
    const userInfo = {
      id: 'abc@gmail.com',
      timezone: 'UTC+8',
      name: {
        familyName: 'family',
        giveName: 'my',
      },
    };
    let stubToken;
    // insert the data first
    before(() => {
      stubToken = sinon.stub(emailService, 'sendSignUpEmail').returns(Promise.resolve('dummyToken'));
      return User.create(userInfo);
    });

    // remove all the data
    after(() => {
      stubToken.restore();
      return User.remove({});
    });

    it('put successfully and replace the data', (done) => {
      const newUserInfo = {
        timezone: 'UTC+7',
        emails: [{
          value: 'aaa@gmail.com',
          type: 'home',
        }],
      };
      agent.put(`/identity/users/${encodeURIComponent(userInfo.id)}`)
        .set('Content-Type', 'application/json')
        .send(newUserInfo)
        .expect(200)
        .end(() => {
          User.findOne({ _id: userInfo.id }).then((user) => {
            const localUser = user.toJSON();
            expect(localUser.timezone).to.equal(newUserInfo.timezone);
            expect(localUser.emails[0]).to.deep.equal(newUserInfo.emails[0]);
          }).done(done);
        });
    });

    it('put successfully and create the data with new id', (done) => {
      const id = 'newNonExistingId@test.com';
      const newUserInfo = {
        title: 'USA',
        gender: 'female',
        phoneNumbers: [{
          value: '9990831',
          type: 'urgent',
        }],
      };
      agent.put(`/identity/users/${encodeURIComponent(id)}`)
        .set('Content-Type', 'application/json')
        .send(newUserInfo)
        .expect(200)
        .end(() => {
          User.findOne({ _id: id }).then((user) => {
            const localUser = user.toJSON();
            expect(localUser.title).to.equal(newUserInfo.title);
            expect(localUser.gender).to.equal(newUserInfo.gender);
            expect(localUser.phoneNumbers).to.deep.equal(newUserInfo.phoneNumbers);
          }).done(done);
        });
    });

    it('unsuccessfully put user with invalid data format', (done) => {
      const unknowId = 'unknownRandomIdNewPut@test.com';
      const myUserInfo = {
        country: 'Hong Kong',
        address: 'Hong Kong',
      };
      agent.put(`/identity/users/${encodeURIComponent(unknowId)}`)
          .set('Content-Type', 'application/json')
          .send(myUserInfo)
          .expect(422)
          .end(done);
    });
  });
});
