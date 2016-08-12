import { describe, it } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';
import Q from 'q';

import getAgent from '../getAgent';
import User from '../../src/collections/user';
import { getContainer } from '../../src/utils/ioc';

describe('POST /openid/resetPassword', () => {
  let agent;
  before((done) => {
    getAgent().then(mAgent => {
      agent = mAgent;
      done();
    });
  });

  describe('request for reset password', () => {
    const userInfo = {
      id: 'abc@gmail.com',
      timezone: 'UTC+8',
      name: {
        familyName: 'family',
        giveName: 'my',
      },
    };
    let emailServiceStub;
    // insert the data first
    before((done) => {
      const { emailService } = getContainer();
      emailServiceStub = sinon.stub(emailService, 'sendResetPasswordEmail')
        .returns(Q.resolve('dummyToken'));
      User.create(userInfo).done(() => done());
    });

    // remove all the data
    after((done) => {
      emailServiceStub.restore();
      User.remove({}, done);
    });

    it('sends request for generate reset password token', done => {
      agent.post('/openid/resetPassword')
        .set('Content-Type', 'application/json')
        .send({ id: userInfo.id })
        .expect(204)
        .end(err => {
          if (err) {
            done(err);
            return;
          }
          // also ensure the model has such record
          User.findOne({ _id: userInfo.id }).then((user) => {
            expect(user.tokens).to.have.lengthOf(1);
            expect(user.tokens[0].event).to.equal('resetPassword');
            expect(user.tokens[0].value).to.equal('dummyToken');
          }).done(done);
        });
    });

    it('sends request for generate reset password token for unknow id', done => {
      agent.post('/openid/resetPassword')
        .set('Content-Type', 'application/json')
        .send({ id: 'unknownID@test.com' })
        .expect(404)
        .end(done);
    });
  });

  describe('request for reset password at the second times', () => {
    const userInfo = {
      id: 'user1@gmail.com',
      timezone: 'UTC+8',
      name: {
        familyName: 'family',
        giveName: 'my',
      },
      tokens: [{
        event: 'resetPassword',
        value: 'test1',
        createdAt: new Date(),
      }],
    };
    let emailServiceStub;
    // insert the data first
    before((done) => {
      const { emailService } = getContainer();
      emailServiceStub = sinon.stub(emailService, 'sendResetPasswordEmail')
        .returns(Q.resolve('dummyToken'));
      User.create(userInfo).done(() => done());
    });

    // remove all the data
    after((done) => {
      emailServiceStub.restore();
      User.remove({}, done);
    });

    it('sends request for generate reset password token and clear the previous one', done => {
      agent.post('/openid/resetPassword')
        .set('Content-Type', 'application/json')
        .send({ id: userInfo.id })
        .expect(204)
        .end(err => {
          if (err) {
            done(err);
            return;
          }
          // also ensure the model has such record
          User.findOne({ _id: userInfo.id }).then((user) => {
            expect(user.tokens).to.have.lengthOf(1);
            expect(user.tokens[0].event).to.equal('resetPassword');
            expect(user.tokens[0].value).to.equal('dummyToken');
          }).done(done);
        });
    });
  });
});
