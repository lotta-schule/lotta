import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  release: process.env.NEXT_PUBLIC_RELEASE_NAME,
  // Replay may only be enabled for the client-side
  integrations: [
    Sentry.extraErrorDataIntegration(),
    Sentry.replayIntegration(),
  ],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 0.15,

  // Capture Replay for 10% of all sessions,
  // plus for 100% of sessions with an error
  replaysSessionSampleRate: 0.01,
  replaysOnErrorSampleRate: 0.05,

  ignoreErrors: [
    // we should remove this when we have finally moved on
    /Network Error/,
    /Du bist nicht angemeldet/,
    /Du musst angemeldet sein um das zu tun./,
    /Du hast nicht die Rechte dir diesen Beitrag anzusehen./,
  ],
});
