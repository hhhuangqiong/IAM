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
            expect(_.omit(res.body, ['id', 'createdAt', 'updatedAt', 'isRoot'])).to.eql(role);
          })
          .end(done);
      });
  });

  it('responds with 201 and role resource and automatically added read, update when necessary', (done) => {
    const company = {
      _id: new ObjectId(),
      country: 'US',
    };

    const role = {
      name: 'Sales Manager',
      company: company._id.toString(),
      service: 'iam',
      permissions: {
        resource1: ['update'],
        resource2: ['delete', 'update'],
        resource3: ['read', 'update'],
        resource4: ['create'],
        resource5: ['delete'],
        resource6: ['create', 'update'],
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
            // expect the server will append read on top of role sent.
            role.permissions.resource1.push('read');
            role.permissions.resource2.push('read');
            role.permissions.resource4.push('read', 'update');
            role.permissions.resource5.push('read', 'update');
            role.permissions.resource6.push('read');
            expect(_.omit(res.body, ['id', 'createdAt', 'updatedAt', 'isRoot'])).to.eql(role);
          })
          .end(done);
      });
  });

  it('responds with 422 and wrong role resource action', (done) => {
    const company = {
      _id: new ObjectId(),
      country: 'US',
    };

    const role = {
      name: 'Sales Manager',
      company: company._id.toString(),
      service: 'iam',
      permissions: {
        resource1: ['edit'],
      },
    };

    context.state.set({ Company: company })
      .then(() => {
        context.server
          .post('/access/roles')
          .send(role)
          .expect(422)
          .end(done);
      });
  });

  it('responds with 403 and no permission to manage company resource', (done) => {
    const company = {
      _id: new ObjectId(),
      country: 'US',
    };

    const role = {
      name: 'Sales Manager',
      company: company._id.toString(),
      service: 'iam',
      permissions: {
        company: ['read', 'create'],
      },
    };

    context.state.set({ Company: company })
      .then(() => {
        context.server
          .post('/access/roles')
          .send(role)
          .expect(403)
          .end(done);
      });
  });

  it('responds with 204 and create the root Role with isRoot true', (done) => {
    const company = {
      _id: new ObjectId(),
      country: 'US',
    };

    const role = {
      name: 'Sales Manager',
      company: company._id.toString(),
      service: 'iam',
      permissions: {
        user: ['read', 'create', 'update'],
      },
    };

    context.state.set({ Company: company })
      .then(() => {
        context.server
          .post('/access/roles')
          .send(role)
          .expect(res => {
            const data = res.body;
            const expected = toPlainObject(role);
            const actual = _.omit(data, 'id', 'createdAt', 'updatedAt', 'isRoot');
            expect(expected).to.eql(actual);
            expect(data.isRoot).to.eql(true);
          })
          .end(done);
      });
  });

  it('responds with 204 and create the root Role with isRoot false', (done) => {
    const company = {
      _id: new ObjectId(),
      country: 'US',
    };

    const role = {
      name: 'Sales Manager',
      company: company._id.toString(),
      service: 'iam',
      permissions: {
        user: ['read', 'create'],
      },
    };

    const newRole = {
      name: 'Sales Staff',
      company: company._id.toString(),
      service: 'iam',
      permissions: {
        user: ['read'],
      },
    };

    context.state.set({ Company: company, Role: role })
      .then(() => {
        context.server
          .post('/access/roles')
          .send(newRole)
          .expect(res => {
            const data = res.body;
            const expected = toPlainObject(newRole);
            const actual = _.omit(data, 'id', 'createdAt', 'updatedAt', 'isRoot');
            expect(expected).to.eql(actual);
            expect(data.isRoot).to.eql(false);
          })
          .end(done);
      });
  });

  it('responds with 204 and create the root Role in another sevice with isRoot true', (done) => {
    const company = {
      _id: new ObjectId(),
      country: 'US',
    };

    const role = {
      name: 'Sales Manager',
      company: company._id.toString(),
      service: 'iam',
      permissions: {
        user: ['read', 'create'],
      },
    };

    const newRole = {
      name: 'Sales Staff',
      company: company._id.toString(),
      service: 'wlp',
      permissions: {
        user: ['read'],
      },
    };

    context.state.set({ Company: company, Role: role })
      .then(() => {
        context.server
          .post('/access/roles')
          .send(newRole)
          .expect(res => {
            const data = res.body;
            const expected = toPlainObject(newRole);
            const actual = _.omit(data, 'id', 'createdAt', 'updatedAt', 'isRoot');
            expect(expected).to.eql(actual);
            expect(data.isRoot).to.eql(true);
          })
          .end(done);
      });
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
              // not set via createRole, ignore the checking on isRoot
              .map(x => _.omit(x, ['createdAt', 'updatedAt', 'isRoot']))
              .value();
            expect(actual).to.eql(expected);
          })
          .end(done);
      });
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
        const Role = context.models.Role;
        context.server
          .delete(`/access/roles/${role._id}`)
          .expect(204)
          .end(err => {
            if (err) return done(err);
            return Role.findOne({ _id: role._id })
              .then(result => expect(result).to.equal(null))
              .then(() => done())
              .catch(done);
          });
      });
  });

  it('responds with 403 and fail to delete root role from database', (done) => {
    const role = {
      _id: new ObjectId(),
      name: 'CEO',
      company: new ObjectId(),
      service: 'iam',
      isRoot: true,
    };

    context.state.set({ Role: role })
      .then(() => {
        context.server
          .delete(`/access/roles/${role._id}`)
          .expect(403)
          .end(done);
      });
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
            const actual = _.omit(data, 'createdAt', 'updatedAt', 'isRoot');
            expect(expected).to.eql(actual);
            expect(data.updatedAt).to.be.greaterThan(data.createdAt);
          })
          .end(done);
      });
  });

  it('responds with 403 and fail to update root role', (done) => {
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
      isRoot: true,
    };

    const updatedRole = _.extend({}, _.omit(role, 'isRoot'), {
      id: role._id.toString(),
      name: 'CTO',
      permissions: {
        calls: ['read'],
      },
    });
    delete updatedRole._id;

    context.state.set({ Company: company, Role: role })
      .then(() => {
        context.server
          .put(`/access/roles/${role._id}`)
          .send(updatedRole)
          .expect(403)
          .end(done);
      });
  });

  it('responds with 200 and update the permission with read, update when necessary', (done) => {
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
        calls: ['create', 'update', 'delete'],
      },
    };

    const updatedRole = _.extend({}, _.omit(role, 'isRoot'), {
      id: role._id.toString(),
      name: 'CTO',
      permissions: {
        calls: ['create', 'update', 'delete', 'read'],
        sms: ['create'],
        users: ['update'],
        roles: ['read', 'delete'],
      },
    });
    delete updatedRole._id;

    context.state.set({ Company: company, Role: role })
      .then(() => {
        context.server
          .put(`/access/roles/${role._id}`)
          .send(updatedRole)
          .expect(200)
          .expect(res => {
            const data = res.body;
            // update data with read and update, so it can compare with the res.body
            updatedRole.permissions.sms.push('read', 'update');
            updatedRole.permissions.users.push('read');
            updatedRole.permissions.roles.push('update');
            const expected = toPlainObject(updatedRole);
            const actual = _.omit(data, 'createdAt', 'updatedAt', 'isRoot');
            expect(expected).to.eql(actual);
            expect(data.updatedAt).to.be.greaterThan(data.createdAt);
          })
          .end(done);
      });
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

  it('responds with 403 when company resources is not allowed', (done) => {
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
      permissions: {
        company: ['read'],
      },
    });
    delete updatedRole._id;
    context.state.set({ Role: role, Company: company })
      .then(() => {
        context.server
          .put(`/access/roles/${role._id}`)
          .send(updatedRole)
          .expect(403)
          .end(done);
      });
  });

  it('responds with 403 when company resources is not allowed', (done) => {
    const company = {
      _id: new ObjectId(),
      country: 'US',
      reseller: true,
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
      permissions: {
        company: ['read'],
      },
    });
    delete updatedRole._id;
    context.state.set({ Role: role, Company: company })
      .then(() => {
        context.server
          .put(`/access/roles/${role._id}`)
          .send(updatedRole)
          .expect(res => {
            const data = res.body;
            const expected = toPlainObject(updatedRole);
            const actual = _.omit(data, 'createdAt', 'updatedAt', 'isRoot');
            expect(expected).to.eql(actual);
            expect(data.updatedAt).to.be.greaterThan(data.createdAt);
          })
          .end(done);
      });
  });
});

describe('PUT /access/users/:username/roles', () => {
  it('responds with 200 and all roles with respect to company and service filter', () => {
    const user = {
      _id: 'user@example.com',
      name: 'John Doe',
    };
    const m800 = {
      _id: new ObjectId(),
      name: 'M800',
      country: 'HK',
    };
    const coke = {
      _id: new ObjectId(),
      name: 'Coca Cola',
      country: 'US',
    };
    const companies = [m800, coke];
    const m800admin = {
      _id: new ObjectId(),
      name: 'M800-Admin',
      service: 'wlp',
      company: m800._id,
      users: [],
    };
    const m800manager = {
      _id: new ObjectId(),
      name: 'M800-Manager',
      service: 'wlp',
      company: m800._id,
      users: [user._id],
    };
    const m800employee = {
      _id: new ObjectId(),
      name: 'M800-Employee',
      service: 'wlp',
      company: m800._id,
      users: [user._id],
    };
    const cokeAdmin = {
      _id: new ObjectId(),
      name: 'Coke-Admin',
      service: 'wlp',
      company: coke._id,
      users: [user._id],
    };
    const cokeEmployee = {
      _id: new ObjectId(),
      name: 'Coke-Employee',
      service: 'live-connect',
      company: coke._id,
      users: [user._id],
    };
    const roles = [
      m800admin,
      m800manager,
      m800employee,
      cokeAdmin,
      cokeEmployee,
    ];

    const reqQuery = {
      service: 'wlp',
      company: m800._id.toString(),
    };
    const reqBody = [m800admin, m800employee]
      .map(x => ({ id: x._id.toString() }));

    return context.state.set({
      Company: companies,
      User: user,
      Role: roles,
    }).then(() => context.server
        .put(`/access/users/${encodeURIComponent(user._id)}/roles`)
        .query(reqQuery)
        .send(reqBody)
    ).then((res) => {
      return context.state.get(['Role'])
        .then(state => {
          // Check that "Coke" roles ware left unmodified
          const cokeRoles = state.Role.filter(x => x.company.toString() === coke._id.toString());
          _.each(cokeRoles, role => {
            expect(role.users).to.have.lengthOf(1);
          });
          // Check that M800 manager role now doesn't contain users
          const managerRole = state.Role.find(x => x._id.toString() === m800manager._id.toString());
          expect(managerRole.users).to.have.lengthOf(0);

          // Check that only roles for the WLP service and M800 company returned
          const expectedRoleIds = reqBody.map(x => x.id).sort();
          const actualRoleIds = res.body.map(x => x.id).sort();
          expect(expectedRoleIds).to.eql(actualRoleIds);
        });
    });
  });
});
