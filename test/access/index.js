import { describe, it } from 'mocha';

import { accessAgent as agent } from '../agents';

// @TODO sample
describe('GET /userRoles', () => {
  it('respond with json', (done) => {
    agent.get('/access/userRoles/userId')
      .expect('Content-Type', /json/)
      .expect(200, {
        roles: ['user'],
      }, done);
  });
});
