import { createConfig } from '@ptitmouton/app-config';

export const appConfig = createConfig({
  PUBLIC_URL: {},
  API_URL: {
    fallback: 'http://localhost:4000',
  },
  API_SOCKET_URL: {},
  FORCE_TENANT_SLUG: {
    fallback: '',
  },
});
