import { Provider } from 'oidc-provider/lib';
import Q from 'q';

import { issuer, config, certificates } from './settings';

export const provider = new Provider(issuer, config);
export function setUp() {
  return Q.all(certificates.map(cert => provider.addKey(cert)));
}
