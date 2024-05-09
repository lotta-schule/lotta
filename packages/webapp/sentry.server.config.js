/// <reference types="node" />
// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment:
    process.env.APP_ENVIRONMENT || process.env.NODE_ENV || 'development',
  enabled: process.env.NODE_ENV === 'production',
  release: process.env.IMAGE_NAME?.split(':')[1] ?? process.version ?? '?',
  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 0.01,
  // ...
  // Note: if you want to override the automatic release value, do not set a
  // `release` value here - use the environment variable `SENTRY_RELEASE`, so
  // that it will also get attached to your source maps
});
