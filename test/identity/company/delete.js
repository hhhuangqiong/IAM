import { describe, it } from 'mocha';
import { expect } from 'chai';

import getAgent from '../../getAgent';
import Company from '../../../src/collections/company';

describe('DELETE /identity/companies/:id', () => {
  let agent;
  before((done) => {
    getAgent().then(mAgent => {
      agent = mAgent;
      done();
    });
  });

  describe('delete the company', () => {
    let companyId;
    // insert the data first
    before(() => {
      const company = {
        country: 'Hong Kong',
        reseller: false,
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
      return Company.create(company)
        .then(mCompany => {
          companyId = mCompany._id.toString();
        });
    });

    // remove all the data
    after((done) => Company.remove({}, done));

    it('successfully deletes the company record', (done) => {
      agent.delete(`/identity/companies/${companyId}`)
           .expect(204)
           .end(() => {
             // check the mongo and expect no more record
             Company.findOne({ _id: companyId }).then((company) => {
               expect(company).to.equal(null);
               done();
             });
           });
    });

    it('successfully deletes the non-existing company record', (done) => {
      agent.delete('/identity/companies/57a047f8281063f8149af643')
           .expect(404)
           .end(done);
    });
  });
});
