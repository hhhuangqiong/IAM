import { describe, it } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';
import Q from 'q';

import getAgent from '../../getAgent';
import User from '../../../src/collections/user';
import { getContainer } from '../../../src/utils/ioc';

describe('PUT /identity/users/:id', () => {
  let agent;
  before((done) => {
    getAgent().then(mAgent => {
      agent = mAgent;
      done();
    });
  });

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
    before((done) => {
      const { emailService } = getContainer();
      stubToken = sinon.stub(emailService, 'sendSignUpEmail').returns(Q.resolve('dummyToken'));
      User.create(userInfo).done(() => done());
    });

    // remove all the data
    after((done) => {
      stubToken.restore();
      User.remove({}, done);
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
        .expect(204)
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
        .expect(201, {
          id,
        })
        .end((err, res) => {
          const expectedHeader = `/identity/users/${encodeURIComponent(id)}`;
          expect(res.header).to.have.property('location');
          expect(res.header.location).to.include(expectedHeader);
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
