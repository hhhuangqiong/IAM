import { Provider } from 'oidc-provider/lib';

import settings from './settings';

// @TODO set up the provider
export const provider = new Provider(settings.issuer, settings.settings);
