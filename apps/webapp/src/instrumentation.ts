import * as Sentry from '@sentry/nextjs';
import { appConfig } from 'config';
import { registerOTel } from '@vercel/otel';

export async function register() {
  const dsn = appConfig.get('NEXT_PUBLIC_SENTRY_DSN');

  if (!dsn) {
    console.warn('Sentry DSN is not set, skipping Sentry initialization');
  }
  const options: Sentry.NodeOptions = {
    dsn,

    environment: appConfig.get('APP_ENVIRONMENT'),
    release: appConfig.get('NEXT_PUBLIC_RELEASE_NAME'),
    enabled: appConfig.get('NODE_ENV') === 'production',
    skipOpenTelemetrySetup: true,
    tracesSampleRate: 0,
  };

  console.log('instrumentation.ts: Sentry options', options);

  Sentry.init(options);
}

// Register OpenTelemetry.
registerOTel({
  serviceName: appConfig.get('SERVICE_NAME'),
});
