import { createConfig } from '@ptitmouton/app-config';

export const appConfig = createConfig({
  PUBLIC_URL: {},
  API_URL: {
    fallback: 'http://localhost:4000',
  },
  FORCE_BASE_URL: {
    fallback: '',
  },
  FORCE_TENANT_SLUG: {
    fallback: '',
  },
  NEXT_PUBLIC_SENTRY_DSN: {
    fallback: '',
  },
  NEXT_PUBLIC_API_SOCKET_URL: {},
  APP_ENVIRONMENT: {
    fallback: process.env.NODE_ENV,
  },
});
