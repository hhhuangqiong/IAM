import _ from 'lodash';
import { it, describe, before } from 'mocha';
import { expect } from 'chai';
import { Types } from 'mongoose';
const ObjectId = Types.ObjectId;

import { initialize } from './test-context';
import { toPlainObject } from './test-util';

let context;

before('initialize test context', () => initialize().then(ctx => {
  context = ctx;
}));

after('clean database state', () => context.state.set({}));

describe('POST /access/roles', () => {
  it('responds with 201 and role resource', (done) => {
    const company = {
      _id: new ObjectId(),
      country: 'US',
    };

    const role = {
      name: 'Sales Manager',
      company: company._id.toString(),
      service: 'iam',
      permissions: {
        resource1: ['read'],
        resource2: ['read', 'update'],
      },
    };

    context.state.set({ Company: company })
      .then(() => {
        context.server
          .post('/access/roles')
          .send(role)
          .expect(201)
          .expect(res => {
            expect(res.body.id).to.be.a('string');
            expect(_.omit(res.body, ['id', 'createdAt', 'updatedAt'])).to.eql(role);
          })
          .end(done);
      })
      .done();
  });

  it('responds with 404 when non existing company id is passed', (done) => {
    const nonExistingId = new ObjectId();
    const role = {
      name: 'Sales Manager',
      company: nonExistingId,
      service: 'iam',
      permissions: {
        resource1: ['read'],
        resource2: ['read', 'update'],
      },
    };
    context.server
      .post('/access/roles')
      .send(role)
      .expect(404)
      .end(done);
  });

  it('responds with 422 when empty name is passed', (done) => {
    const role = {
      name: '',
      company: 'm800.com',
      service: 'iam',
      permissions: {
        resource1: ['read'],
        resource2: ['read', 'update'],
      },
    };
    context.server
      .post('/access/roles')
      .send(role)
      .expect(422)
      .end(done);
  });
});

describe('GET /access/roles', () => {
  it('returns roles filtered by service and company id', (done) => {
    const company1Id = new ObjectId();
    const company2Id = new ObjectId();

    const roles = [{
      _id: new ObjectId(),
      name: 'CEO',
      company: company1Id,
      service: 'wlp',
      permissions: {
        res1: ['create', 'update'],
        res2: ['create', 'update', 'delete', 'read'],
      },
    }, {
      _id: new ObjectId(),
      name: 'CTO',
      company: company1Id,
      service: 'wlp',
      permissions: {
        res1: ['create', 'update'],
        res2: ['create', 'update', 'delete', 'read'],
      },
    }, {
      _id: new ObjectId(),
      name: 'Sales Manager',
      company: company2Id,
      service: 'iam',
    }, {
      _id: new ObjectId(),
      name: 'Director',
      company: company2Id,
      service: 'wlp',
      permissions: {
        res1: ['create', 'update'],
        res2: ['create', 'update', 'delete', 'read'],
      },
    }];

    context.state.set({ Role: roles })
      .then(() => {
        const service = roles[0].service;
        const company = company2Id;

        context.server
          .get(`/access/roles?service=${service}&company=${company}`)
          .expect(200)
          .expect(res => {
            const expected = _(roles)
              .filter(x => x.service === service && x.company.toString() === company.toString())
              .sortBy(x => x.name)
              .map(x => {
                x.id = x._id.toString();
                delete x._id;
                x.company = x.company.toString();
                return x;
              })
              .value();
            const actual = _(res.body)
              .sortBy(x => x.name)
              .map(x => _.omit(x, ['createdAt', 'updatedAt']))
              .value();
            expect(expected).to.eql(actual);
          })
          .end(done);
      })
      .done();
  });
});

describe('DELETE /access/roles/:roleId', () => {
  it('responds with 204 and deletes role from database', (done) => {
    const role = {
      _id: new ObjectId(),
      name: 'CEO',
      company: new ObjectId(),
      service: 'iam',
    };

    context.state.set({ Role: role })
      .then(() => {
        const Role = context.db.model('Role');
        context.server
          .delete(`/access/roles/${role._id}`)
          .expect(204)
          .end(err => {
            if (err) return done(err);
            return Role.findOne({ _id: role._id })
              .then(result => expect(result).to.equal(null))
              .then(() => done())
              .catch(done)
              .done();
          });
      })
      .done();
  });
});

describe('PUT /access/roles/:id', () => {
  it('responds with 200 and updated role object', (done) => {
    const company = {
      _id: new ObjectId(),
      country: 'US',
    };
    const role = {
      _id: new ObjectId(),
      name: 'CEO',
      company: company._id,
      service: 'wlp',
      permissions: {
        sms: ['read'],
        calls: ['create', 'read', 'update', 'delete'],
      },
    };

    const updatedRole = _.extend({}, role, {
      id: role._id.toString(),
      name: 'CTO',
      permissions: {
        calls: ['read'],
      },
    });
    delete updatedRole._id;

    context.state.set({ Role: role, Company: company })
      .then(() => {
        context.server
          .put(`/access/roles/${role._id}`)
          .send(updatedRole)
          .expect(200)
          .expect(res => {
            const data = res.body;
            const expected = toPlainObject(updatedRole);
            const actual = _.omit(data, 'createdAt', 'updatedAt');
            expect(expected).to.eql(actual);
            expect(data.updatedAt).to.be.greaterThan(data.createdAt);
          })
          .end(done);
      })
      .done();
  });

  it('responds with 404 when role does not exist', (done) => {
    const nonExistingId = new ObjectId();
    const role = {
      name: 'CEO',
      company: new ObjectId().toString(),
      service: 'wlp',
      permissions: {
        sms: ['read'],
        calls: ['create', 'read', 'update', 'delete'],
      },
    };
    context.server
      .put(`/access/roles/${nonExistingId}`)
      .send(role)
      .expect(404)
      .end(done);
  });
});

describe('POST /access/roles/:roleId/users', () => {
  it('responds with 200 and role assignment resource', (done) => {
    const role = {
      _id: new ObjectId(),
      name: 'CEO',
      company: new ObjectId(),
      service: 'wlp',
      permissions: {
        sms: ['read'],
        calls: ['create', 'read', 'update', 'delete'],
      },
    };

    const user = {
      _id: 'johndoe@tests.com',
      country: 'US',
    };

    context.state.set({ Role: role, User: user })
      .then(() => {
        context.server
          .post(`/access/roles/${role._id}/users`)
          .send({ username: user._id })
          .expect(200, {
            username: user._id.toString(),
            roleId: role._id.toString(),
          })
          .end(done);
      })
      .done();
  });
  it('responds with 404 when non existing username is passed', (done) => {
    const role = {
      _id: new ObjectId(),
      name: 'CEO',
      company: new ObjectId(),
      service: 'wlp',
      permissions: {
        sms: ['read'],
        calls: ['create', 'read', 'update', 'delete'],
      },
    };
    const username = 'test@username.com';
    context.state.set({ Role: role })
      .then(() => {
        context.server
          .post(`/access/roles/${role._id}/users`)
          .send({ username })
          .expect(404)
          .end(done);
      })
      .done();
  });
});

describe('DELETE /access/roles/:roleId/users/:userId', () => {
  it('responds with 204 and updates role in database', (done) => {
    const Role = context.db.model('Role');
    const user = {
      _id: 'johndoe@tests.com',
    };
    const role = {
      _id: new ObjectId(),
      name: 'CEO',
      company: new ObjectId(),
      service: 'wlp',
      users: [user._id],
      permissions: {
        sms: ['read'],
        calls: ['create', 'read', 'update', 'delete'],
      },
    };

    context.state.set({ Role: role, User: user })
      .then(() => {
        context.server
          .delete(`/access/roles/${role._id}/users/${user._id}`)
          .expect(204)
          .end(err => {
            if (err) {
              return done(err);
            }
            return Role.findOne({ _id: role._id })
              .then(updatedRole => {
                expect(updatedRole.users).to.have.length(0);
                done();
              })
              .catch(done)
              .done();
          });
      })
      .done();
  });
});
