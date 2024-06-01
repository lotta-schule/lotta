import * as Sentry from '@sentry/nextjs';
import { appConfig } from 'config';
import { registerOTel } from '@vercel/otel';

export async function register() {
  Sentry.init({
    dsn: appConfig.get('NEXT_PUBLIC_SENTRY_DSN') || undefined,

    environment: appConfig.get('APP_ENVIRONMENT'),
    enabled: appConfig.get('NODE_ENV') === 'production',
    // Adjust this value in production, or use tracesSampler for greater control

    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate:
      appConfig.get('APP_ENVIRONMENT') === 'production' ? 0.01 : 0.05,
  });

  // Register OpenTelemetry.
  registerOTel('lotta-web');
}
