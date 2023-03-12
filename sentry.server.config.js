// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';
import getConfig from 'next/config';

const {
    publicRuntimeConfig: { appEnvironment, imageName, sentryDsn },
} = getConfig();

Sentry.init({
    dsn: sentryDsn,
    environment: appEnvironment,
    enabled: appEnvironment && !['test', 'development'].includes(appEnvironment),
    release: imageName.split(':')[1],
    // Adjust this value in production, or use tracesSampler for greater control
    tracesSampleRate: 0.01,
    // ...
    // Note: if you want to override the automatic release value, do not set a
    // `release` value here - use the environment variable `SENTRY_RELEASE`, so
    // that it will also get attached to your source maps
});
