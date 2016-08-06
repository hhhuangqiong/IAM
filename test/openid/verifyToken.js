import { describe, it } from 'mocha';
import { expect } from 'chai';
import bcrypt from 'bcrypt';

import getAgent from '../getAgent';
import User from '../../src/collections/user';

describe('POST /openid/setPassword', () => {
  let agent;
  before((done) => {
    getAgent().then(mAgent => {
      agent = mAgent;
      done();
    });
  });

  describe('reset the passwords successfully use the correct code', () => {
    const token = '12S@AtestSAs@%#';
    const userInfo = {
      id: 'abc@gmail.com',
      timezone: 'UTC+8',
      name: {
        familyName: 'family',
        giveName: 'my',
      },
      tokens: [{
        event: 'resetPassword',
        value: token,
        createdAt: new Date(),
      }],
    };
    // insert the data first
    beforeEach((done) => User.create(userInfo).done(() => done()));

    // remove all the data
    afterEach((done) => User.remove({}, done));

    it('reset passwords sucessfully', done => {
      const updatePWBody = {
        id: userInfo.id,
        password: '13@aAn',
        token,
        event: 'resetPassword',
      };
      agent.post('/openid/setPassword')
        .set('Content-Type', 'application/json')
        .send(updatePWBody)
        .expect(204)
        .end(err => {
          if (err) {
            done(err);
            return;
          }
          User.findOne({ _id: userInfo.id }).then((user) => {
            expect(user.tokens).to.have.lengthOf(0);
            expect(user.hashedPassword).not.to.equal(undefined);
            expect(bcrypt.compareSync(updatePWBody.password, user.hashedPassword)).to.equal(true);
          }).done(done);
        });
    });

    it('reset passwords unsucessfully with wrong token', done => {
      const wrongPWBody = {
        id: userInfo.id,
        password: 'life',
        token: 'dreamComeTrue',
        event: 'resetPassword',
      };
      agent.post('/openid/setPassword')
        .set('Content-Type', 'application/json')
        .send(wrongPWBody)
        .expect(422)
        .end(err => {
          if (err) {
            done(err);
            return;
          }
          User.findOne({ _id: userInfo.id }).then((user) => {
            expect(user.tokens).to.have.lengthOf(1);
          }).done(done);
        });
    });
  });

  describe('reset password after 3 hours', () => {
    const createdTime = new Date();
    createdTime.setHours(createdTime.getHours() - 3);
    const token = '12S@AtestSAs@%#';
    const userInfo = {
      id: 'abc@gmail.com',
      timezone: 'UTC+8',
      name: {
        familyName: 'family',
        giveName: 'my',
      },
      tokens: [{
        event: 'resetPassword',
        value: token,
        createdAt: createdTime,
      }],
    };
    // insert the data first
    before((done) => User.create(userInfo).done(() => done()));

    // remove all the data
    after((done) => User.remove({}, done));

    it('reset passwords unsucessfully with expired token', done => {
      const updatePWBody = {
        id: userInfo.id,
        password: '@DsadSA41&^*aAn',
        token,
        event: 'resetPassword',
      };
      // after 3 hours
      agent.post('/openid/setPassword')
        .set('Content-Type', 'application/json')
        .send(updatePWBody)
        .expect(422)
        .end(err => {
          if (err) {
            done(err);
            return;
          }
          User.findOne({ _id: userInfo.id }).then((user) => {
            expect(user.tokens).to.have.lengthOf(0);
            expect(user.hashedPassword).to.equal(undefined);
          }).done(done);
        });
    });
  });


  describe('set the passwords successfully use the correct code', () => {
    const token = '12S@AtestSAs@%#';
    const userInfo = {
      id: 'abc@gmail.com',
      timezone: 'UTC+8',
      name: {
        familyName: 'family',
        giveName: 'my',
      },
      tokens: [{
        event: 'setPassword',
        value: token,
        createdAt: new Date(),
      }],
    };
    // insert the data first
    beforeEach((done) => User.create(userInfo).done(() => done()));

    // remove all the data
    afterEach((done) => User.remove({}, done));

    it('set passwords sucessfully', done => {
      const updatePWBody = {
        id: userInfo.id,
        password: '13@aAn',
        token,
        event: 'setPassword',
      };
      agent.post('/openid/setPassword')
        .set('Content-Type', 'application/json')
        .send(updatePWBody)
        .expect(204)
        .end(err => {
          if (err) {
            done(err);
            return;
          }
          User.findOne({ _id: userInfo.id }).then((user) => {
            expect(user.tokens).to.have.lengthOf(0);
            expect(user.hashedPassword).not.to.equal(undefined);
            expect(bcrypt.compareSync(updatePWBody.password, user.hashedPassword)).to.equal(true);
          }).done(done);
        });
    });
  });

  describe('set password after 3 hours', () => {
    const createdTime = new Date();
    createdTime.setHours(createdTime.getHours() - 3);
    const token = '12S@AtestSAs@%#';
    const userInfo = {
      id: 'abc@gmail.com',
      timezone: 'UTC+8',
      name: {
        familyName: 'family',
        giveName: 'my',
      },
      tokens: [{
        event: 'setPassword',
        value: token,
        createdAt: createdTime,
      }],
    };
    // insert the data first
    before((done) => User.create(userInfo).done(() => done()));

    // remove all the data
    after((done) => User.remove({}, done));

    it('set passwords sucessfully', done => {
      const updatePWBody = {
        id: userInfo.id,
        password: '@DsadSA41&^*aAn',
        token,
        event: 'setPassword',
      };
      // after 3 hours
      agent.post('/openid/setPassword')
        .set('Content-Type', 'application/json')
        .send(updatePWBody)
        .expect(204)
        .end(err => {
          if (err) {
            done(err);
            return;
          }
          User.findOne({ _id: userInfo.id }).then((user) => {
            expect(user.tokens).to.have.lengthOf(0);
            expect(user.hashedPassword).not.to.equal(undefined);
            expect(bcrypt.compareSync(updatePWBody.password, user.hashedPassword)).to.equal(true);
          }).done(done);
        });
    });
  });
});
