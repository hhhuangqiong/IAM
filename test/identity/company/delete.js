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
    // insert the data first
    before((done) => {
      const company = {
        id: 'companyA',
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
      Company.create(company, done);
    });

    // remove all the data
    after((done) => Company.remove({}, done));

    it('successfully deletes the company record', (done) => {
      const id = 'companyA';
      agent.delete(`/identity/companies/${id}`)
           .expect(204)
           .end(() => {
             // check the mongo and expect no more record
             Company.findOne({ id }).then((company) => {
               expect(company).to.equal(null);
               done();
             });
           });
    });

    it('successfully deletes the non-existing company record', (done) => {
      agent.delete('/identity/companies/companyNotExist')
           .expect(404, {
             result: {
               code: 20001,
               status: 404,
               message: 'Not Found: "company id companyNotExist"',
             },
           })
           .end(done);
    });
  });
});
