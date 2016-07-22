import { describe, it } from 'mocha';
import { expect } from 'chai';
import bcrypt from 'bcrypt';

import getAgent from '../../getAgent';
import User from '../../../src/collections/user';

describe('POST /identity/users', () => {
  let agent;
  before((done) => {
    getAgent().then(mAgent => {
      agent = mAgent;
      done();
    });
  });

  describe('create a user', () => {
    // remove all the data after each test
    afterEach((done) => User.remove({}, done));

    it('fails to create company without any content', (done) => {
      agent.post('/identity/users')
           .expect(422, {
             result: {
               code: 20001,
               message: 'Missing argument: username',
               status: 422,
             },
           })
           .end(done);
    });

    it('fails to create user without username', (done) => {
      const userInfo = {
        name: 'Marco F',
      };
      agent.post('/identity/users')
           .set('Content-Type', 'application/json')
           .send(userInfo)
           .expect(422, {
             result: {
               code: 20001,
               message: 'Missing argument: username',
               status: 422,
             },
           })
           .end(done);
    });

    it('successfully creates users and check display name', (done) => {
      const userInfo = {
        username: 'marcof@abc.com',
        name: {
          familyName: 'F',
          givenName: 'Marco',
        },
      };
      agent.post('/identity/users')
           .set('Content-Type', 'application/json')
           .send(userInfo)
           .expect(201)
           .end((err, res) => {
             const expectedHeader = `/identity/users/${userInfo.username}`;
             expect(res.header).to.have.property('location');
             expect(res.header.location).to.include(expectedHeader);

             // also ensure the model has such record
             User.findOne({ username: userInfo.username }).then((user) => {
               expect(user.userName).to.equal(userInfo.userName);
               expect(user.displayName).to
                 .equal(`${userInfo.name.givenName} ${userInfo.name.familyName}`);
             })
             .done(done);
           });
    });

    it('successfully creates user with all attribute', (done) => {
      const userInfo = {
        isRoot: true,
        username: 'user@test.abc',
        name: {
          formatted: 'Johnny M. Richmond',
          familyName: 'Richmond',
          givenName: 'Johnny',
          middleName: 'M',
        },
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

      agent.post('/identity/users')
           .set('Content-Type', 'application/json')
           .send(userInfo)
           .expect(201)
           .end((err, res) => {
             const expectedHeader = `/identity/users/${userInfo.username}`;
             expect(res.header).to.have.property('location');
             expect(res.header.location).to.include(expectedHeader);
             User.findOne({ username: userInfo.username }).then((user) => {
               const localUser = user.toObject();
               // ensure the value are stored in the mongo
               Object.keys(userInfo).forEach(key =>
                  expect(localUser[key]).to.deep.equal(userInfo[key])
               );
             })
             .done(done);
           });
    });

    it('successfully creates user with encrpted password stored', (done) => {
      const userInfo = {
        username: 'companyB',
        password: '123456',
      };
      agent.post('/identity/users')
           .set('Content-Type', 'application/json')
           .send(userInfo)
           .expect(201)
           .end(() => {
             User.findOne({ username: userInfo.username }).then((user) => {
               expect(user.salt).not.to.equal(undefined);
               expect(user.hashedPassword).not.to.equal(undefined);
               expect(bcrypt.compareSync(userInfo.password, user.hashedPassword)).to.equal(true);
               expect(bcrypt.compareSync('abcdef', user.hashedPassword)).not.to.equal(true);
             })
             .done(done);
           });
    });

    it('unsuccessfully creates user with invalid data format', (done) => {
      const userInfo = {
        username: 'testUser@abc.com',
        address: 'Hong Kong',
      };
      agent.post('/identity/users')
           .set('Content-Type', 'application/json')
           .send(userInfo)
           .expect(422, {
             result: {
               code: 20003,
               status: 422,
               message: '/address with Unknown property (not in schema) ',
             },
           })
           .end(done);
    });
  });
});