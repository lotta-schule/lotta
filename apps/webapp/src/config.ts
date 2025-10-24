import { createConfig } from '@ptitmouton/app-config';

export const appConfig = createConfig({
  NODE_ENV: {
    fallback: 'development',
  },
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
  API_SOCKET_URL: {
    fallback: 'ws://localhost:4000/user-socket/graphql',
  },
  APP_ENVIRONMENT: {
    fallback: process.env.NODE_ENV ?? 'development',
  },
  NEXT_PUBLIC_RELEASE_NAME: {
    fallback: '',
  },
  SERVICE_NAME: {
    fallback: 'web',
  },
});
