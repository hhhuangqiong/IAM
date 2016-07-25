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

    // insert the data first
    before((done) => Company.create(companyInfo, done));

    // remove all the data
    after((done) => Company.remove({}, done));

    it('patches with incorrect operation', (done) => {
      const wrongFormat = {
        wrong: 'format',
      };
      agent.patch(`/identity/companies/${companyInfo.id}`)
           .set('Content-Type', 'application/json')
           .send(wrongFormat)
           .expect(422, {
             result: {
               status: 422,
               code: 20003,
               message: 'Patch requests a set of changes in an array',
             },
           })
           .end(done);
    });

    it('patches with a new id and create company with wrong operation', (done) => {
      const patches = [{
        op: 'replace',
        path: '/password',
        value: 'company',
      }];
      agent.patch('/identity/companies/notExitingComapny')
           .set('Content-Type', 'application/json')
           .send(patches)
           .expect(422, {
             result: {
               status: 422,
               code: 20003,
               message: 'Invalid operation number 0: Cannot perform the operation ' +
               'at a path that does not exist',
             },
           })
           .end(done);
    });

    it('patches with a new companyid and create company with right operation', (done) => {
      const newId = 'notExistedUsername123';
      const patches = [{
        op: 'add',
        path: '/country',
        value: 'USA',
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
             const expectedHeader = `/identity/companies/${newId}`;
             expect(res.header).to.have.property('location');
             expect(res.header.location).to.include(expectedHeader);
             Company.findOne({ _id: newId }).then((company) => {
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
      agent.patch(`/identity/companies/${companyInfo.id}`)
           .set('Content-Type', 'application/json')
           .send(patches)
           .expect(204)
           .end(() => {
             Company.findOne({ _id: companyInfo.id }).then((company) => {
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
      agent.patch(`/identity/companies/${companyInfo.id}`)
           .set('Content-Type', 'application/json')
           .send(patches)
           .expect(422, {
             result: {
               status: 422,
               code: 20003,
               message: 'Invalid operation number 0: Operation `op` property ' +
                'is not one of operations defined in RFC-6902',
             },
           })
           .end(done);
    });

    it('patches with a existing id and perform wrong format', (done) => {
      const patches = [{
        op: 'replace',
        path: '/country',
        value: 123,
      }];
      agent.patch(`/identity/companies/${companyInfo.id}`)
           .set('Content-Type', 'application/json')
           .send(patches)
           .expect(422, {
             result: {
               status: 422,
               code: 20003,
               message: '/country with Invalid type: number (expected string) ',
             },
           })
           .end(done);
    });

    it('patches with a existing id and perform wrong schema', (done) => {
      const patches = [{
        op: 'add',
        path: '/nonExisting',
        value: 'dummy',
      }];
      agent.patch(`/identity/companies/${companyInfo.id}`)
           .set('Content-Type', 'application/json')
           .send(patches)
           .expect(422, {
             result: {
               status: 422,
               code: 20003,
               message: '/nonExisting with Unknown property (not in schema) ',
             },
           })
           .end(done);
    });
  });
});
