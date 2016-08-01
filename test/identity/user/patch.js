import { describe, it } from 'mocha';
import { expect } from 'chai';
import jsonpatch from 'fast-json-patch';
import bcrypt from 'bcrypt';

import getAgent from '../../getAgent';
import User from '../../../src/collections/user';

describe('PATCH /identity/users', () => {
  let agent;
  before((done) => {
    getAgent().then(mAgent => {
      agent = mAgent;
      done();
    });
  });

  describe('patch existing user', () => {
    const userInfo = {
      isRoot: true,
      id: 'user@test.abc',
      name: {
        formatted: 'Johnny M. Richmond',
        familyName: 'Richmond',
        givenName: 'Johnny',
        middleName: 'M',
      },
      password: 'secret',
      nickName: 'Johnny R',
      profileUrl: 'http://google.com',
      title: 'FBI',
      userType: 'internal',
      preferredLanguage: 'en',
      timezone: 'UTC+8',
      active: true,
      emails: [{
        primary: true,
        type: 'work',
        display: 'user@test.abc',
        value: 'user@test.abc',
        verified: false,
      }],
      phoneNumbers: [{
        primary: true,
        type: 'work',
        value: '912345678',
        verified: false,
      }, {
        type: 'home',
        value: '212345678',
        verified: false,
      }],
      ims: [{
        primary: true,
        type: 'skype',
        value: 'johnnyR',
      }],
      photos: [{
        type: 'photo',
        value: 'http://abc.com/image.png',
      }],
      addresses: [{
        formatted: '2 Tim Mei Avenue, Tamar, Hong Kong',
        streetAddress: '2 Tim Mei Avenue',
        country: 'Hong Kong',
        type: 'work',
      }],
      x509Certificates: [{
        value: 'MIIDQzCCAqygAwIBAgICEAAwDQYJKoZIhvcNAQEFBQAwTjELMAkGA1UEBhMCV=',
      }],
    };

    // insert the data first
    before((done) => User.create(userInfo, done));

    // remove all the data
    after((done) => User.remove({}, done));

    it('patches with incorrect operation', (done) => {
      const wrongFormat = {
        wrong: 'format',
      };
      agent.patch(`/identity/users/${userInfo.id}`)
           .set('Content-Type', 'application/json')
           .send(wrongFormat)
           .expect(422)
           .end(done);
    });

    it('patches with a new id and create user with wrong operation', (done) => {
      const patches = [{
        op: 'replace',
        path: '/password',
        value: 'th1omas',
      }];
      agent.patch('/identity/users/notExistedUsername')
           .set('Content-Type', 'application/json')
           .send(patches)
           .expect(422)
           .end(done);
    });

    it('patches with a new id and create user with right operation', (done) => {
      const newName = 'notExistedUsername123';
      const patches = [{
        op: 'add',
        path: '/password',
        value: 'th1omas',
      }, {
        op: 'add',
        path: '/name',
        value: {
          familyName: 'May',
        },
      }];
      agent.patch(`/identity/users/${newName}`)
           .set('Content-Type', 'application/json')
           .send(patches)
           .expect(201)
           .end((err, res) => {
             const expectedHeader = `/identity/users/${newName}`;
             expect(res.header).to.have.property('location');
             expect(res.header.location).to.include(expectedHeader);
             User.findOne({ _id: newName }).then((user) => {
               const localUser = user.toObject();
               expect(localUser.name.familyName).to.equal(patches[1].value.familyName);
               expect(bcrypt.compareSync(patches[0].value, user.hashedPassword)).to.equal(true);
             })
             .done(done);
           });
    });

    it('patches with existing id and perform operation without changing password', (done) => {
      const observer = jsonpatch.observe(userInfo);
      userInfo.active = false;
      const patches = jsonpatch.generate(observer);
      agent.patch(`/identity/users/${userInfo.id}`)
           .set('Content-Type', 'application/json')
           .send(patches)
           .expect(204)
           .end(() => {
             User.findOne({ _id: userInfo.id }).then((user) => {
               const localUser = user.toObject();
               expect(localUser.active).to.equal(userInfo.active);
               expect(bcrypt.compareSync(userInfo.password, user.hashedPassword)).to.equal(true);
             })
             .done(done);
           });
    });

    it('patches with a existing id and perform right operation', (done) => {
      const observer = jsonpatch.observe(userInfo);
      userInfo.password = 'thomas';
      userInfo.name.familyName = 'May';
      userInfo.emails.push({
        type: 'home',
        display: 'home@abc.com',
        value: 'home@abc.com',
      });
      const patches = jsonpatch.generate(observer);
      agent.patch(`/identity/users/${userInfo.id}`)
           .set('Content-Type', 'application/json')
           .send(patches)
           .expect(204)
           .end(() => {
             User.findOne({ _id: userInfo.id }).then((user) => {
               const localUser = user.toObject();
               expect(localUser.name.familyName).to.equal(userInfo.name.familyName);
               expect(bcrypt.compareSync(userInfo.password, user.hashedPassword)).to.equal(true);
               expect(localUser.emails).to.have.length(2);
               expect(localUser.emails[1]).to.deep.equal(userInfo.emails[1]);
             })
             .done(done);
           });
    });

    it('patches with a existing id and perform wrong operation', (done) => {
      const patches = [{
        op: '9add',
        path: '/pasjsword',
        value: 'th1omas',
      }];
      agent.patch(`/identity/users/${userInfo.id}`)
           .set('Content-Type', 'application/json')
           .send(patches)
           .expect(422)
           .end(done);
    });

    it('patches with a existing id and perform wrong format', (done) => {
      const patches = [{
        op: 'replace',
        path: '/active',
        value: 'string',
      }];
      agent.patch(`/identity/users/${userInfo.id}`)
           .set('Content-Type', 'application/json')
           .send(patches)
           .expect(422)
           .end(done);
    });

    it('patches with a existing id and perform wrong schema', (done) => {
      const patches = [{
        op: 'add',
        path: '/nonExisting',
        value: 'dummy',
      }];
      agent.patch(`/identity/users/${userInfo.id}`)
           .set('Content-Type', 'application/json')
           .send(patches)
           .expect(422)
           .end(done);
    });
  });
});
