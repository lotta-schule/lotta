/// <reference types="node" />
// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';
import { appConfig } from 'config';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: appConfig.get('APP_ENVIRONMENT'),
  enabled: appConfig.get('NODE_ENV') === 'production',
  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate:
    appConfig.get('APP_ENVIRONMENT') === 'production' ? 0.001 : 0.01,
});
