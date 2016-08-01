import { describe, it } from 'mocha';
import { expect } from 'chai';

import getAgent from '../../getAgent';
import Company from '../../../src/collections/company';

describe('POST /identity/companies', () => {
  let agent;
  before((done) => {
    getAgent().then(mAgent => {
      agent = mAgent;
      done();
    });
  });

  describe('create a company', () => {
    // remove all the data after each test
    afterEach((done) => Company.remove({}, done));

    it('fails to create company without any content', (done) => {
      agent.post('/identity/companies')
           .expect(422)
           .end(done);
    });

    it('fails to create company without id', (done) => {
      const companyInfo = {
        country: 'Hong Kong',
      };
      agent.post('/identity/companies')
           .set('Content-Type', 'application/json')
           .send(companyInfo)
           .expect(422)
           .end(done);
    });

    it('fails to create company without country', (done) => {
      const companyInfo = {
        id: 'companyA',
      };
      agent.post('/identity/companies')
           .set('Content-Type', 'application/json')
           .send(companyInfo)
           .expect(422)
           .end(done);
    });

    it('successfully creates company', (done) => {
      const companyInfo = {
        id: 'companyB',
        country: 'Hong Kong',
      };
      agent.post('/identity/companies')
           .set('Content-Type', 'application/json')
           .send(companyInfo)
           .expect(201)
           .end((err, res) => {
             const expectedHeader = `/identity/companies/${companyInfo.id}`;
             expect(res.header).to.have.property('location');
             expect(res.header.location).to.include(expectedHeader);

             // also ensure the model has such record
             Company.findOne({ _id: companyInfo.id }).then((company) => {
               expect(company.country).to.equal(companyInfo.country);
             })
             .done(done);
           });
    });

    it('successfully creates company with more details', (done) => {
      const companyInfo = {
        id: 'companyC',
        country: 'Hong Kong',
        reseller: true,
        name: 'Another name',
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
      };

      agent.post('/identity/companies')
           .set('Content-Type', 'application/json')
           .send(companyInfo)
           .expect(201)
           .end((err, res) => {
             const expectedHeader = `/identity/companies/${companyInfo.id}`;
             expect(res.header).to.have.property('location');
             expect(res.header.location).to.include(expectedHeader);
             Company.findOne({ _id: companyInfo.id }).then((company) => {
               expect(company.country).to.equal(companyInfo.country);
               expect(company.name).to.equal(companyInfo.name);
               expect(company.themeType).to.equal(companyInfo.themeType);
               expect(company.reseller).to.equal(companyInfo.reseller);
               expect(company.timezone).to.equal(companyInfo.timezone);
               expect(company.accountManager).to.equal(companyInfo.accountManager);
               expect(company.address).to.deep.contain(companyInfo.address);
               expect(company.supportContact[0]).to.deep.contain(companyInfo.supportContact[0]);
               expect(company.technicalContact[0]).to.deep.contain(companyInfo.technicalContact[0]);
               expect(company.businessContact[0]).to.deep.contain(companyInfo.businessContact[0]);
             })
             .done(done);
           });
    });

    it('unsuccessfully creates company with invalid data format', (done) => {
      const companyInfo = {
        id: 'companyB',
        country: 'Hong Kong',
        address: 'Hong Kong',
      };
      agent.post('/identity/companies')
           .set('Content-Type', 'application/json')
           .send(companyInfo)
           .expect(422)
           .end(done);
    });
  });

  describe('create another company when there is existing company', () => {
    const companyInfo = {
      id: 'companyD',
      country: 'Hong Kong',
    };
    let companyId;

    // insert the data first
    before((done) => Company.create(companyInfo)
      .then((company) => {
        /* eslint no-underscore-dangle: ["error", { "allow": ["company", "_id"] }]*/
        companyId = company._id.toString();
        done();
      })
    );

    // clean up the data
    after((done) => Company.remove({}, done));

    it('fails to create duplicate company id', (done) => {
      agent.post('/identity/companies')
           .set('Content-Type', 'application/json')
           .send(companyInfo)
           .expect(409)
           .end(done);
    });

    it('create a new company and link up when parent company is mentioned', (done) => {
      const anotherCompanyInfo = {
        parent: 'companyD',
        id: 'companyE',
        country: 'Hong Kong',
      };
      agent.post('/identity/companies')
           .set('Content-Type', 'application/json')
           .send(anotherCompanyInfo)
           .expect(201)
           .end(() => {
             Company.findOne({ _id: anotherCompanyInfo.id }).then((company) => {
               expect(company.parent.toString()).to.equal(companyId);
               expect(company.id).to.equal(anotherCompanyInfo.id);
             })
             .done(done);
           });
    });
  });
});
