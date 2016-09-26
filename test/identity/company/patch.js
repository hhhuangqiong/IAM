import { describe, it } from 'mocha';
import { expect } from 'chai';
import jsonpatch from 'fast-json-patch';

import getAgent from '../../getAgent';
import Company from '../../../src/collections/company';

describe('PATCH /identity/companies', () => {
  let agent;
  before((done) => {
    getAgent().then(mAgent => {
      agent = mAgent;
      done();
    });
  });

  describe('patch existing user', () => {
    let companyId;
    const companyInfo = {
      country: 'HK',
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

    // insert the data first
    before(() => Company.create(companyInfo)
      .then(company => {
        companyId = company._id.toString();
      }));

    // remove all the data
    after((done) => Company.remove({}, done));

    it('patches with incorrect operation', (done) => {
      const wrongFormat = {
        wrong: 'format',
      };
      agent.patch(`/identity/companies/${companyId}`)
           .set('Content-Type', 'application/json')
           .send(wrongFormat)
           .expect(422)
           .end(done);
    });

    it('patches with a new id and create company with wrong operation', (done) => {
      const patches = [{
        op: 'replace',
        path: '/password',
        value: 'company',
      }];
      agent.patch('/identity/companies/57a047f8281063f814aaaa43')
           .set('Content-Type', 'application/json')
           .send(patches)
           .expect(422)
           .end(done);
    });

    it('patches with a new companyid and create company with right operation', (done) => {
      const newId = '57a047f8281163fc149af64b';
      const patches = [{
        op: 'add',
        path: '/country',
        value: 'US',
      }, {
        op: 'add',
        path: '/address',
        value: {
          formatted: 'Hong Kong',
        },
      }];
      agent.patch(`/identity/companies/${newId}`)
           .set('Content-Type', 'application/json')
           .send(patches)
           .expect(201)
           .end((err, res) => {
             expect(res.body).to.have.property('id');
             const expectedHeader = `/identity/companies/${res.body.id}`;
             expect(res.header).to.have.property('location');
             expect(res.header.location).to.include(expectedHeader);
             Company.findOne({ _id: res.body.id }).then((company) => {
               const localCompany = company.toJSON();
               expect(localCompany.country).to.equal(patches[0].value);
               expect(localCompany.address).to.deep.equal(patches[1].value);
             })
             .done(done);
           });
    });

    it('patches with existing id and perform operation', (done) => {
      const observer = jsonpatch.observe(companyInfo);
      companyInfo.timezone = 'UTC+9';
      companyInfo.technicalContact.push({
        name: 'You',
        phone: '124244123',
        email: 'hi@gmail.com',
      });
      const patches = jsonpatch.generate(observer);
      agent.patch(`/identity/companies/${companyId}`)
           .set('Content-Type', 'application/json')
           .send(patches)
           .expect(204)
           .end(() => {
             Company.findOne({ _id: companyId }).then((company) => {
               const localCompany = company.toJSON();
               expect(localCompany.timezone).to.equal(companyInfo.timezone);
               expect(localCompany.technicalContact).to.deep.equal(companyInfo.technicalContact);
             })
             .done(done);
           });
    });

    it('patches with a existing id and perform wrong operation', (done) => {
      const patches = [{
        op: 'goAway',
        path: '/country',
        value: 'universe',
      }];
      agent.patch(`/identity/companies/${companyId}`)
           .set('Content-Type', 'application/json')
           .send(patches)
           .expect(422)
           .end(done);
    });

    it('patches with a existing id and perform wrong format', (done) => {
      const patches = [{
        op: 'replace',
        path: '/country',
        value: 123,
      }];
      agent.patch(`/identity/companies/${companyId}`)
           .set('Content-Type', 'application/json')
           .send(patches)
           .expect(422)
           .end(done);
    });

    it('patches with a existing id and perform wrong schema', (done) => {
      const patches = [{
        op: 'add',
        path: '/nonExisting',
        value: 'dummy',
      }];
      agent.patch(`/identity/companies/${companyId}`)
           .set('Content-Type', 'application/json')
           .send(patches)
           .expect(422)
           .end(done);
    });
  });
});
