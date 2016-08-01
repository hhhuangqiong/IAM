import { describe, it } from 'mocha';
import { expect } from 'chai';

import getAgent from '../../getAgent';
import Company from '../../../src/collections/company';

describe('PUT /identity/companies/:companyId', () => {
  let agent;
  before((done) => {
    getAgent().then(mAgent => {
      agent = mAgent;
      done();
    });
  });

  describe('replace the data', () => {
    const companyInfo = {
      id: 'CompanyHK',
      country: 'Hong Kong',
      themeType: 'blue',
    };
    // insert the data first
    before((done) => Company.create(companyInfo).done(() => done()));

    // remove all the data
    after((done) => Company.remove({}, done));

    it('put successfully and replace the data', (done) => {
      const newCompanyInfo = {
        country: 'USA',
        themeType: 'red',
        address: {
          formatted: 'USA',
        },
      };
      agent.put(`/identity/companies/${companyInfo.id}`)
        .set('Content-Type', 'application/json')
        .send(newCompanyInfo)
        .expect(204)
        .end(() => {
          Company.findOne({ _id: companyInfo.id }).then((company) => {
            expect(company.themeType).to.equal(newCompanyInfo.themeType);
            expect(company.address.formatted).to.equal(newCompanyInfo.address.formatted);
            expect(company.country).to.equal(newCompanyInfo.country);
          }).done(done);
        });
    });

    it('put successfully and create the data with new id', (done) => {
      const id = 'newNonExistingId';
      const newCompanyInfo = {
        country: 'USA',
        themeType: 'red',
        address: {
          formatted: 'USA',
        },
      };
      agent.put(`/identity/companies/${id}`)
        .set('Content-Type', 'application/json')
        .send(newCompanyInfo)
        .expect(201, {
          id,
        })
        .end((err, res) => {
          const expectedHeader = `/identity/companies/${id}`;
          expect(res.header).to.have.property('location');
          expect(res.header.location).to.include(expectedHeader);
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
        country: 'Hong Kong',
        address: 'Hong Kong',
      };
      agent.put(`/identity/companies/${unknowId}`)
          .set('Content-Type', 'application/json')
          .send(myCompanyInfo)
          .expect(422)
          .end(done);
    });

    it('put unsuccessfully with missing id', (done) => {
      const newCompanyInfo = {
        country: 'USA',
        themeType: 'red',
        address: {
          formatted: 'USA',
        },
      };
      agent.put('/identity/companies')
        .set('Content-Type', 'application/json')
        .send(newCompanyInfo)
        .expect(404)
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
