import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  release: process.env.NEXT_PUBLIC_RELEASE_NAME,
  integrations: [
    Sentry.extraErrorDataIntegration(),
    Sentry.replayIntegration(),
  ],

  tracesSampleRate: 0.15,

  tracePropagationTargets: [/^\/api/, process.env.NEXT_PUBLIC_API_URL],

  replaysSessionSampleRate: 0.01,
  replaysOnErrorSampleRate: 0.05,

  ignoreErrors: [
    /Network Error/,
    /Du bist nicht angemeldet/,
    /Du musst angemeldet sein um das zu tun./,
    /Du hast nicht die Rechte dir diesen Beitrag anzusehen./,
  ],
});
