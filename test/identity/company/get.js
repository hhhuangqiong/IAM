import { describe, it } from 'mocha';
import { expect } from 'chai';
import sortBy from 'lodash/sortBy';

import getAgent from '../../getAgent';
import Company from '../../../src/collections/company';
import {
  DEFAULT_PAGE_SIZE,
  DEFAULT_PAGE_NO,
} from '../../../src/constants/param';

function removeDynamicAttribute(company) {
  const myCompany = company;
  delete myCompany.createdAt;
  delete myCompany.updatedAt;
  delete myCompany.createdBy;
  delete myCompany.updatedBy;
  return myCompany;
}
describe('GET /identity/companies', () => {
  let agent;
  before((done) => {
    getAgent().then(mAgent => {
      agent = mAgent;
      done();
    });
  });

  describe('get all the companies', () => {
    let companyArray = [];
    // insert the data first
    before(() => {
      let count = 0;
      while (count < 25) {
        companyArray.push({
          name: `company${count}`,
          country: 'Hong Kong',
          reseller: count === 0,
          active: true,
          themeType: 'awesome',
          address: {
            formatted: '2 Tim Mei Avenue, Tamar, Hong Kong',
            streetAddress: '2 Tim Mei Avenue',
            country: 'Hong Kong',
          },
          timezone: 'UTC+8',
          accountManager: 'Marco',
          businessContact: [{
            name: 'Marco',
            phone: '612345678',
            email: 'Marco@abc.com',
          }],
          technicalContact: [{
            name: 'Marco F',
            phone: '612345679',
            email: 'MarcoF@abc.com',
          }],
          supportContact: [{
            name: 'Marco Fa',
            phone: '612345670',
            email: 'MarcoFa@abc.com',
          }],
        });
        count++;
      }
      // auto sort the data first
      companyArray = sortBy(companyArray, ['name']);
      return Company.create(companyArray).
        then(result => {
          // update the record for the array id and later compare with them
          result.forEach((item, index) => {
            companyArray[index].id = item._id.toString();
          });
        });
    });

    // remove all the data
    after((done) => Company.remove({}, done));

    it('successfully gets all the companies with first page data', (done) => {
      agent.get('/identity/companies')
           .expect('Content-Type', /json/)
           .expect(200)
           .end((err, res) => {
             expect(res).to.have.property('body');
             expect(res.body.total).to.equal(companyArray.length);
             expect(res.body.pageSize).to.equal(DEFAULT_PAGE_SIZE);
             expect(res.body.page).to.equal(DEFAULT_PAGE_NO);
             expect(res.body.items).to.have.lengthOf(DEFAULT_PAGE_SIZE);
             for (let i = 0; i < DEFAULT_PAGE_SIZE; i++) {
               const currentObj = removeDynamicAttribute(res.body.items[i]);
               expect(currentObj).to.deep.equal(companyArray[i]);
             }
             done();
           });
    });

    it('successfully gets all the companies using param limit', (done) => {
      const size = 5;
      agent.get(`/identity/companies?pageSize=${size}`)
           .expect('Content-Type', /json/)
           .expect(200)
           .end((err, res) => {
             expect(res).to.have.property('body');
             expect(res.body.total).to.equal(companyArray.length);
             expect(res.body.page).to.equal(DEFAULT_PAGE_NO);
             expect(res.body.pageSize).to.equal(size);
             expect(res.body.items).to.have.lengthOf(size);
             for (let i = 0; i < size; i++) {
               const currentObj = removeDynamicAttribute(res.body.items[i]);
               expect(currentObj).to.deep.equal(companyArray[i]);
             }
             done();
           });
    });

    it('successfully gets the companies using param page', (done) => {
      const pageNo = 2;
      agent.get(`/identity/companies?page=${pageNo}`)
           .expect('Content-Type', /json/)
           .expect(200)
           .end((err, res) => {
             const expectedItemNo = companyArray.length - (pageNo - 1) * DEFAULT_PAGE_SIZE;
             expect(res).to.have.property('body');
             expect(res.body.total).to.equal(companyArray.length);
             expect(res.body.page).to.equal(pageNo);
             expect(res.body.pageSize).to.equal(DEFAULT_PAGE_SIZE);
             expect(res.body.items).to.have.lengthOf(expectedItemNo);
             for (let i = 0; i < expectedItemNo; i++) {
               const currentObj = removeDynamicAttribute(res.body.items[i]);
               expect(currentObj).to.deep.equal(companyArray[(pageNo - 1) * DEFAULT_PAGE_SIZE + i]);
             }
             done();
           });
    });

    it('successfully gets the companies using param page and limit', (done) => {
      const pageNo = 2;
      const pageSize = 5;
      agent.get(`/identity/companies?page=${pageNo}&pageSize=${pageSize}`)
           .expect('Content-Type', /json/)
           .expect(200)
           .end((err, res) => {
             expect(res).to.have.property('body');
             expect(res.body.total).to.equal(companyArray.length);
             expect(res.body.page).to.equal(pageNo);
             expect(res.body.pageSize).to.equal(pageSize);
             expect(res.body.items).to.have.lengthOf(pageSize);
             for (let i = 0; i < pageSize; i++) {
               const currentObj = removeDynamicAttribute(res.body.items[i]);
               expect(currentObj).to.deep.equal(companyArray[(pageNo - 1) * pageSize + i]);
             }
             done();
           });
    });

    it('successfully gets all the companies using sort', (done) => {
      agent.get('/identity/companies?sortBy=id&sortOrder=desc')
           .expect('Content-Type', /json/)
           .expect(200)
           .end((err, res) => {
             expect(res).to.have.property('body');
             expect(res.body.total).to.equal(companyArray.length);
             expect(res.body.pageSize).to.equal(DEFAULT_PAGE_SIZE);
             expect(res.body.items).to.have.lengthOf(DEFAULT_PAGE_SIZE);
             for (let i = 0; i < DEFAULT_PAGE_SIZE; i++) {
               const currentObj = removeDynamicAttribute(res.body.items[i]);
               expect(currentObj).to.deep.equal(companyArray[companyArray.length - 1 - i]);
             }
             done();
           });
    });

    it('successfully get the exact company data', (done) => {
      const targetCompany = companyArray[0];
      agent.get(`/identity/companies/${targetCompany.id}`)
           .expect('Content-Type', /json/)
           .expect(200)
           .end((err, res) => {
             expect(res).to.have.property('body');
             expect(removeDynamicAttribute(res.body)).to.deep.equal(targetCompany);
             done();
           });
    });

    it('fails get the non-existing company data', (done) => {
      agent.get('/identity/companies/57a047f8281063f8149af64a')
           .expect(404)
           .end(done);
    });

    it('fails get the invalid company id', (done) => {
      agent.get('/identity/companies/wrongIdFormat')
           .expect(422)
           .end(done);
    });
  });
});
