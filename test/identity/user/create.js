import { describe, it } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';
import Promise from 'bluebird';

import getTestContext from '../../testContext';

describe('POST /identity/users', () => {
  let agent;
  let User;
  let emailService;
  before(() =>
    getTestContext().then(({ agent: mAgent, models, app }) => {
      agent = mAgent;
      User = models.User;
      emailService = app.EmailService;
    }));

  describe('create a user', () => {
    let stubToken;
    before(() => {
      stubToken = sinon.stub(emailService, 'sendSignUpEmail').returns(Promise.resolve('dummyToken'));
    });
    after(() => {
      stubToken.restore();
    });
    // remove all the data after each test
    afterEach(() => User.remove({}));

    it('fails to create company without any content', (done) => {
      agent.post('/identity/users')
           .expect(422)
           .end(done);
    });

    it('fails to create user without id', (done) => {
      const userInfo = {
        name: 'Marco F',
      };
      agent.post('/identity/users')
           .set('Content-Type', 'application/json')
           .send(userInfo)
           .expect(422)
           .end(done);
    });

    it('successfully creates users and check display name', (done) => {
      const userInfo = {
        id: 'marcof@abc.com',
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
             const expectedHeader = `/identity/users/${encodeURIComponent(userInfo.id)}`;
             expect(res.header).to.have.property('location');
             expect(res.header.location).to.include(expectedHeader);

             // also ensure the model has such record
             User.findOne({ _id: userInfo.id }).then((user) => {
               expect(user.id).to.equal(userInfo.id);
               expect(user.displayName).to
                 .equal(`${userInfo.name.givenName} ${userInfo.name.familyName}`);
             })
             .done(done);
           });
    });

    it('successfully creates user with all attribute', (done) => {
      const userInfo = {
        id: 'user@test.abc',
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
             const expectedHeader = `/identity/users/${encodeURIComponent(userInfo.id)}`;
             expect(res.header).to.have.property('location');
             expect(res.header.location).to.include(expectedHeader);
             User.findOne({ _id: userInfo.id }).then((user) => {
               const localUser = user.toJSON();
               // ensure the value are stored in the mongo
               Object.keys(userInfo).forEach(key =>
                  expect(localUser[key]).to.deep.equal(userInfo[key])
               );
             })
             .done(done);
           });
    });

    it('unsuccessfully creates user with invalid data format', (done) => {
      const userInfo = {
        id: 'testUser@abc.com',
        address: 'Hong Kong',
      };
      agent.post('/identity/users')
           .set('Content-Type', 'application/json')
           .send(userInfo)
           .expect(422)
           .end(done);
    });
  });

  describe('request the user sign up/password', () => {
    const userInfo = {
      id: 'Johnny@gmail.com',
      name: {
        formatted: 'Johnny M. Richmond',
        familyName: 'Richmond',
        givenName: 'Johnny',
        middleName: 'M',
      },
      nickName: 'Johnny R',
    };
    const dummyToken = 'asd#@#@';
    let emailServiceStub;
    // insert the data first
    before(() => {
      emailServiceStub = sinon.stub(emailService, 'sendSignUpEmail')
        .returns(Promise.resolve(dummyToken));
      return User.create(userInfo);
    });
    // remove all the data
    after(() => {
      emailServiceStub.restore();
      return User.remove({});
    });

    it('201 request for signup email and generate token', done => {
      agent.post(`/identity/users/${encodeURIComponent(userInfo.id)}/requestSetPassword`)
       .set('Content-Type', 'application/json')
       .send()
       .expect(204)
       .end(err => {
         if (err) {
           done(err);
           return;
         }
         // also ensure the model has such record
         User.findOne({ _id: userInfo.id }).then((user) => {
           expect(user.tokens).to.have.lengthOf(1);
           expect(user.tokens[0].event).to.equal('setPassword');
           expect(user.tokens[0].value).to.equal(dummyToken);
         }).done(done);
       });
    });
  });
});
