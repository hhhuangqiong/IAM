import { describe, it } from 'mocha';
import { expect } from 'chai';

import getAgent from '../../getAgent';
import Company from '../../../src/collections/company';

describe('PATCH /identity/companies/:companyId', () => {
  let agent;
  before((done) => {
    getAgent().then(mAgent => {
      agent = mAgent;
      done();
    });
  });

  describe('update the data', () => {
    const companyInfo = {
      id: 'CompanyHK',
      country: 'Hong Kong',
      themeType: 'blue',
    };
    // insert the data first
    before((done) => Company.create(companyInfo).done(() => done()));

    // remove all the data
    after((done) => Company.remove({}, done));

    it('patch successfully and update the data', (done) => {
      const newCompanyInfo = {
        themeType: 'red',
        address: {
          formatted: 'USA',
        },
      };
      agent.patch(`/identity/companies/${companyInfo.id}`)
        .set('Content-Type', 'application/json')
        .send(newCompanyInfo)
        .expect(204)
        .end(() => {
          Company.findOne({ id: companyInfo.id }).then((company) => {
            expect(company.themeType).to.equal(newCompanyInfo.themeType);
            expect(company.address.formatted).to.equal(newCompanyInfo.address.formatted);
          }).done(done);
        });
    });

    it('patch unsuccessfully with missing id', (done) => {
      const newCompanyInfo = {
        country: 'USA',
        themeType: 'red',
        address: {
          formatted: 'USA',
        },
      };
      agent.patch('/identity/companies')
        .set('Content-Type', 'application/json')
        .send(newCompanyInfo)
        .expect(404)
        .end(done);
    });

    it('patch successfully with non-existing id and create', (done) => {
      const unknowId = 'unknownRandomId';
      const newCompanyInfo = {
        country: 'USA',
        themeType: 'red',
        address: {
          formatted: 'USA',
        },
      };
      agent.patch(`/identity/companies/${unknowId}`)
        .set('Content-Type', 'application/json')
        .send(newCompanyInfo)
        .expect(201, {
          id: unknowId,
        })
        .end((err, res) => {
          const expectedHeader = `/identity/companies/${unknowId}`;
          expect(res.header).to.have.property('location');
          expect(res.header.location).to.include(expectedHeader);
          Company.findOne({ id: unknowId }).then((company) => {
            expect(company.themeType).to.equal(newCompanyInfo.themeType);
            expect(company.address.formatted).to.equal(newCompanyInfo.address.formatted);
            expect(company.country).to.equal(newCompanyInfo.country);
          }).done(done);
        });
    });

    it('unsuccessfully patches company with invalid data format', (done) => {
      const unknowId = 'unknownRandomIdNew';
      const myCompanyInfo = {
        country: 'Hong Kong',
        address: 'Hong Kong',
      };
      agent.patch(`/identity/companies/${unknowId}`)
          .set('Content-Type', 'application/json')
          .send(myCompanyInfo)
          .expect(422, {
            result: {
              code: 20003,
              status: 422,
              message: '/address with Invalid type: string (expected object) ',
            },
          })
          .end(done);
    });
  });
});
