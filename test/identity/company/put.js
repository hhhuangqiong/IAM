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
    let companyId;
    const companyInfo = {
      country: 'Hong Kong',
      themeType: 'blue',
    };
    // insert the data first
    before(() => Company.create(companyInfo).then(company => {
      companyId = company._id.toString();
    }));

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
      agent.put(`/identity/companies/${companyId}`)
        .set('Content-Type', 'application/json')
        .send(newCompanyInfo)
        .expect(204)
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
          expect(res.body).to.have.property('id');
          const expectedHeader = `/identity/companies/${res.body.id}`;
          expect(res.header).to.have.property('location');
          expect(res.header.location).to.include(expectedHeader);
          Company.findOne({ _id: res.body.id }).then((company) => {
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
