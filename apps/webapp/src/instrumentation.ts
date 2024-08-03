import * as Sentry from '@sentry/nextjs';
import { appConfig } from 'config';
import { registerOTel } from '@vercel/otel';

export async function register() {
  Sentry.init({
    dsn: appConfig.get('NEXT_PUBLIC_SENTRY_DSN') || undefined,

    environment: appConfig.get('APP_ENVIRONMENT'),
    enabled: appConfig.get('NODE_ENV') === 'production',
    skipOpenTelemetrySetup: true,
    tracesSampleRate: 0,
  });

  // Register OpenTelemetry.
  registerOTel({
    serviceName: process.env.SERVICE_NAME ?? 'web',
  });
}
