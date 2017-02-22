import { describe, it } from 'mocha';
import { expect } from 'chai';
import sortBy from 'lodash/sortBy';

import getTestContext from '../../testContext';
import {
  DEFAULT_PAGE_SIZE,
  DEFAULT_PAGE_NO,
} from '../../../src/services';

function removeDynamicAttribute(user) {
  const myUser = user;
  delete myUser.createdAt;
  delete myUser.updatedAt;
  delete myUser.createdBy;
  delete myUser.updatedBy;
  delete myUser.isVerified;
  delete myUser._id;
  // expect all the user are isRoot false
  delete myUser.isRoot;
  return myUser;
}

describe('GET /identity/users', () => {
  let agent;
  let User;
  before(() =>
    getTestContext().then(({ agent: mAgent, models }) => {
      agent = mAgent;
      User = models.User;
    }));


  describe('get all the users', () => {
    let userArray = [];
    // insert the data first
    before(() => {
      let count = 0;
      while (count < 45) {
        userArray.push({
          id: `user${count}@test.com`,
          name: {
            familyName: 'bigFamily',
            givenName: `No${count}`,
          },
          nickName: `No${count}`,
          profileUrl: 'http://google.com',
          title: 'Genius',
          userType: 'internal',
          preferredLanguage: 'en',
          timezone: 'UTC+8',
          active: true,
          emails: [{
            primary: true,
            type: 'work',
            display: `user${count}@test.abc`,
            value: `user${count}@test.abc`,
            verified: false,
          }],
          phoneNumbers: [{
            primary: true,
            type: 'work',
            value: '912345678',
            verified: false,
          }],
          photos: [{
            type: 'photo',
            value: 'http://abc.com/company.png',
          }],
          addresses: [{
            formatted: '2 Tim Mei Avenue, Tamar, Hong Kong',
            streetAddress: '2 Tim Mei Avenue',
            country: 'Hong Kong',
            type: 'work',
          }],
        });
        count++;
      }
      // auto sort the data first
      userArray = sortBy(userArray, ['id']);
      return User.create(userArray).then(() => {
        // manually update the displayName, so that it is easier for checking
        userArray.forEach((item, index) => {
          userArray[index].displayName = `${item.name.givenName} ${item.name.familyName}`;
        });
      });
    });

    // remove all the data
    after(() => User.remove({}));

    it('successfully gets all the companies with first page data', (done) => {
      agent.get('/identity/users')
           .expect('Content-Type', /json/)
           .expect(200)
           .end((err, res) => {
             expect(res).to.have.property('body');
             expect(res.body.total).to.equal(userArray.length);
             expect(res.body.pageSize).to.equal(DEFAULT_PAGE_SIZE);
             expect(res.body.page).to.equal(DEFAULT_PAGE_NO);
             expect(res.body.items).to.have.lengthOf(DEFAULT_PAGE_SIZE);
             for (let i = 0; i < DEFAULT_PAGE_SIZE; i++) {
               const currentObj = removeDynamicAttribute(res.body.items[i]);
               expect(currentObj).to.deep.equal(userArray[i]);
             }
             done();
           });
    });

    it('successfully gets users using small size param', (done) => {
      const size = 5;
      agent.get(`/identity/users?pageSize=${size}`)
           .expect('Content-Type', /json/)
           .expect(200)
           .end((err, res) => {
             expect(res).to.have.property('body');
             expect(res.body.total).to.equal(userArray.length);
             expect(res.body.page).to.equal(DEFAULT_PAGE_NO);
             expect(res.body.pageSize).to.equal(size);
             expect(res.body.items).to.have.lengthOf(size);
             for (let i = 0; i < size; i++) {
               const currentObj = removeDynamicAttribute(res.body.items[i]);
               expect(currentObj).to.deep.equal(userArray[i]);
             }
             done();
           });
    });

    it('successfully gets users using large size param', (done) => {
      const size = 100;
      agent.get(`/identity/users?pageSize=${size}`)
           .expect('Content-Type', /json/)
           .expect(200)
           .end((err, res) => {
             expect(res).to.have.property('body');
             expect(res.body.total).to.equal(userArray.length);
             expect(res.body.page).to.equal(DEFAULT_PAGE_NO);
             expect(res.body.pageSize).to.equal(size);
             expect(res.body.items).to.have.lengthOf(userArray.length);
             for (let i = 0; i < userArray.length; i++) {
               const currentObj = removeDynamicAttribute(res.body.items[i]);
               expect(currentObj).to.deep.equal(userArray[i]);
             }
             done();
           });
    });

    it('successfully gets all the users using page no param', (done) => {
      const pageNo = 2;
      agent.get(`/identity/users?page=${pageNo}`)
           .expect('Content-Type', /json/)
           .expect(200)
           .end((err, res) => {
             const expectedItemNo = Math.min(userArray.length -
               (pageNo - 1) * DEFAULT_PAGE_SIZE, DEFAULT_PAGE_SIZE);
             expect(res).to.have.property('body');
             expect(res.body.total).to.equal(userArray.length);
             expect(res.body.page).to.equal(pageNo);
             expect(res.body.pageSize).to.equal(DEFAULT_PAGE_SIZE);
             expect(res.body.items).to.have.lengthOf(expectedItemNo);
             for (let i = 0; i < expectedItemNo; i++) {
               const currentObj = removeDynamicAttribute(res.body.items[i]);
               const expectedIndex = (pageNo - 1) * DEFAULT_PAGE_SIZE + i;
               expect(currentObj).to.deep.equal(userArray[expectedIndex]);
             }
             done();
           });
    });

    it('successfully gets all the users using param page and limit', (done) => {
      const pageNo = 2;
      const pageSize = 5;
      agent.get(`/identity/users?page=${pageNo}&pageSize=${pageSize}`)
           .expect('Content-Type', /json/)
           .expect(200)
           .end((err, res) => {
             expect(res).to.have.property('body');
             expect(res.body.total).to.equal(userArray.length);
             expect(res.body.page).to.equal(pageNo);
             expect(res.body.pageSize).to.equal(pageSize);
             expect(res.body.items).to.have.lengthOf(pageSize);
             for (let i = 0; i < pageSize; i++) {
               const currentObj = removeDynamicAttribute(res.body.items[i]);
               expect(currentObj).to.deep.equal(userArray[(pageNo - 1) * pageSize + i]);
             }
             done();
           });
    });

    it('successfully gets all the users using sort', (done) => {
      const sortById = 'id';
      const sortOrder = 'desc';
      agent.get(`/identity/users?sortBy=${sortById}&sortOrder=${sortOrder}`)
           .expect('Content-Type', /json/)
           .expect(200)
           .end((err, res) => {
             expect(res).to.have.property('body');
             expect(res.body.total).to.equal(userArray.length);
             expect(res.body.pageSize).to.equal(DEFAULT_PAGE_SIZE);
             expect(res.body.items).to.have.lengthOf(DEFAULT_PAGE_SIZE);
             for (let i = 0; i < DEFAULT_PAGE_SIZE; i++) {
               const currentObj = removeDynamicAttribute(res.body.items[i]);
               expect(currentObj).to.deep.equal(userArray[userArray.length - 1 - i]);
             }
             done();
           });
    });

    it('successfully get the exact user data', (done) => {
      const targetUser = userArray[0];
      agent.get(`/identity/users/${encodeURIComponent(targetUser.id)}`)
           .expect('Content-Type', /json/)
           .expect(200)
           .end((err, res) => {
             expect(res).to.have.property('body');
             expect(removeDynamicAttribute(res.body)).to.deep.equal(targetUser);
             done();
           });
    });

    it('fails get the non-existing user data', (done) => {
      agent.get(`/identity/users/${encodeURIComponent('nonExistingUser@abc.com')}`)
           .expect(404)
           .end(done);
    });
  });
});
