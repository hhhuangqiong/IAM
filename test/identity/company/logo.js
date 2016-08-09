import { describe, it } from 'mocha';
import path from 'path';
import { expect } from 'chai';
import fs from 'fs';

import getAgent from '../../getAgent';
import Company from '../../../src/collections/company';
import { getContainer } from '../../../src/utils/ioc';

function removeGridFs(done) {
  const { mongoose: { connection } } = getContainer();
  // fail to use gridfs to remove all files once
  // directly clean the collection it
  connection.db.dropCollection('fs.files', () => {
    connection.db.dropCollection('fs.chunks', () => {
      done();
    });
  });
}

describe('perform logo action', () => {
  let agent;
  let gridFs;
  before(() => getAgent().then(mAgent => {
    agent = mAgent;
    gridFs = getContainer().gridFs;
  }));

  describe('POST /identity/companies/:companyid/logo', () => {
    const companyInfo = {
      country: 'Hong Kong',
    };
    let companyId;
    const companyLogo = path.resolve(__dirname, '../../res/logo.png');
    // insert the data first
    before(() => Company.create(companyInfo).then(company => {
      companyId = company._id.toString();
    }));

    // remove all the data
    after((done) => {
      Company.remove({})
        .then(() => removeGridFs(done));
    });

    it('uploads successfully the logo to the company', (done) => {
      agent.post(`/identity/companies/${companyId}/logo`)
        .set('Content-Type', 'multipart/form-data')
        .attach('logo', companyLogo)
        .expect(201)
        .end((err, res) => {
          expect(res.header).to.have.property('location');
          expect(res.body).to.have.property('id');
          expect(res.header.location).to.include(res.body.id);
          Company.findOne({ _id: companyId }).then((company) => {
            expect(company).to.have.property('logo');
            expect(company.logo.toString()).to.equal(res.body.id);
          }).then(() => {
            // check file if exist on the grid-fs
            gridFs.findOne({ _id: res.body.id }, (error, data) => {
              expect(error).to.equal(null);
              expect(data).to.not.equal(null);
              done();
            });
          });
        });
    });

    it('uploads unsuccessfully the logo to the non-existing company', (done) => {
      agent.post('/identity/companies/57a047f8281063f8149af640/logo')
        .set('Content-Type', 'multipart/form-data')
        .attach('logo', companyLogo)
        .expect(404)
        .end(done);
    });

    it('uploads unsuccessfully to the company without logo field', (done) => {
      agent.post(`/identity/companies/${companyId}/logo`)
        .expect(422)
        .end(done);
    });

    it('uploads unsuccessfully to the company with unexpected file field', (done) => {
      agent.post(`/identity/companies/${companyId}/logo`)
        .set('Content-Type', 'multipart/form-data')
        .attach('logo1', companyLogo)
        .expect(422)
        .end(done);
    });
  });

  describe('GET /identity/companies/logo/:logoId', () => {
    const companyInfo = {
      country: 'Hong Kong',
    };
    const companyLogo = path.resolve(__dirname, '../../res/logo.png');
    let fileId;
    // insert the data first
    before((done) => {
      const writeStream = gridFs.createWriteStream();
      fs.createReadStream(companyLogo).pipe(writeStream);
      writeStream.on('close', (file) => {
        // update the value for the company logo with logo file object id
        /* eslint no-underscore-dangle: ["error", { "allow": ["company", "_id"] }]*/
        companyInfo.logo = file._id;
        fileId = file._id;
        Company.create(companyInfo).done(() => done());
      });
    });

    // remove all the data
    after((done) => {
      Company.remove({})
        .then(() => removeGridFs(done));
    });

    it('get successfully the logo', (done) => {
      agent.get(`/identity/companies/logo/${fileId}`)
        .expect(200)
        .end(done);
    });

    it('get unsuccessfully the logo with wrong id format', (done) => {
      agent.get('/identity/companies/logo/wrongId')
        .expect(422)
        .end(done);
    });

    it('get unsuccessfully the logo with wrong id', (done) => {
      agent.get('/identity/companies/logo/57a047f8281063f8149af6a3')
        .expect(404)
        .end(done);
    });

    it('get unsuccessfully the logo without id', (done) => {
      agent.get('/identity/companies/logo')
        .expect(422)
        .end(done);
    });
  });

  describe('DELETE /identity/companies/:companyId/logo with logo', () => {
    const companyInfo = {
      country: 'Hong Kong',
    };
    let companyId;
    const companyLogo = path.resolve(__dirname, '../../res/logo.png');
    // insert the data first
    before((done) => {
      const writeStream = gridFs.createWriteStream();
      fs.createReadStream(companyLogo).pipe(writeStream);
      writeStream.on('close', (file) => {
        // update the value for the company logo with logo file object id
        /* eslint no-underscore-dangle: ["error", { "allow": ["company", "_id"] }]*/
        companyInfo.logo = file._id;
        Company.create(companyInfo).then(company => {
          companyId = company._id.toString();
        }).done(done);
      });
    });

    // remove all the data
    after((done) => {
      Company.remove({})
        .then(() => removeGridFs(done));
    });

    it('delete successfully the logo', (done) => {
      agent.delete(`/identity/companies/${companyId}/logo`)
        .expect(204)
        .end(() => {
          // expect the Company info logo link is removed
          Company.findOne({ _id: companyId })
            .then((myCompany) => {
              expect(myCompany.logo).to.equal(undefined);
              done();
            });
        });
    });

    it('delete unsuccessfully the logo with wrong companyid', (done) => {
      agent.delete('/identity/companies/57a04694281063f8149af633/logo')
        .expect(404)
        .end(done);
    });

    it('delete unsuccessfully the logo with wrong companyid format', (done) => {
      agent.delete('/identity/companies/wrongFormat/logo')
        .expect(422)
        .end(done);
    });
  });

  describe('DELETE /identity/companies/:companyId/logo without logoFile', () => {
    const companyInfo = {
      country: 'Hong Kong',
    };
    let companyId;
    // insert the data first
    before(() => Company.create(companyInfo).then(company => {
      companyId = company._id.toString();
    }));

    // remove all the data
    after((done) => Company.remove({}, done));

    it('delete successfully the logo', (done) => {
      agent.delete(`/identity/companies/${companyId}/logo`)
        .expect(404)
        .end(done);
    });
  });
});
