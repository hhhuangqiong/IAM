import { describe, it } from 'mocha';
import { expect } from 'chai';

import getTestContext from '../../testContext';

describe('PUT /identity/companies/:companyId', () => {
  let agent;
  let Company;
  before(() =>
    getTestContext().then(({ agent: mAgent, models }) => {
      agent = mAgent;
      Company = models.Company;
    }));

  describe('replace the data', () => {
    let companyId;
    const companyInfo = {
      country: 'HK',
      themeType: 'blue',
    };
    // insert the data first
    before(() => Company.create(companyInfo).then(company => {
      companyId = company._id.toString();
    }));

    // remove all the data
    after(() => Company.remove({}));

    it('put successfully and replace the data', (done) => {
      const newCompanyInfo = {
        country: 'US',
        themeType: 'red',
        address: {
          formatted: 'USA',
        },
      };
      agent.put(`/identity/companies/${companyId}`)
        .set('Content-Type', 'application/json')
        .send(newCompanyInfo)
        .expect(200)
        .end(() => {
          Company.findOne({ _id: companyId }).then((company) => {
            expect(company.themeType).to.equal(newCompanyInfo.themeType);
            expect(company.address.formatted).to.equal(newCompanyInfo.address.formatted);
            expect(company.country).to.equal(newCompanyInfo.country);
          }).done(done);
        });
    });

    it('put successfully and create the data with new id', (done) => {
      const id = '57a047f8281063f8149af641';
      const newCompanyInfo = {
        country: 'US',
        themeType: 'red',
        address: {
          formatted: 'USA',
        },
      };
      agent.put(`/identity/companies/${id}`)
        .set('Content-Type', 'application/json')
        .send(newCompanyInfo)
        .expect(200)
        .end(() => {
          Company.findOne({ _id: id }).then((company) => {
            expect(company.themeType).to.equal(newCompanyInfo.themeType);
            expect(company.address.formatted).to.equal(newCompanyInfo.address.formatted);
            expect(company.country).to.equal(newCompanyInfo.country);
          }).done(done);
        });
    });

    it('unsuccessfully put company with invalid data format', (done) => {
      const unknowId = 'unknownRandomIdNewPut';
      const myCompanyInfo = {
        country: 'HK',
        address: 'Hong Kong',
      };
      agent.put(`/identity/companies/${unknowId}`)
          .set('Content-Type', 'application/json')
          .send(myCompanyInfo)
          .expect(422)
          .end(done);
    });

    it('put unsuccessfully with missing required field', (done) => {
      const newCompanyInfo = {
        themeType: 'red',
        address: {
          formatted: 'USA',
        },
      };
      agent.put('/identity/companies/newIdTest')
        .set('Content-Type', 'application/json')
        .send(newCompanyInfo)
        .expect(422)
        .end(done);
    });
  });
});
