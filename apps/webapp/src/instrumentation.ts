import * as Sentry from '@sentry/nextjs';
import { appConfig } from 'config';
import { registerOTel } from '@vercel/otel';

export const onRequestError = Sentry.captureRequestError;

export async function register() {
  const dsn = appConfig.get('NEXT_PUBLIC_SENTRY_DSN');
  const release = appConfig.get('NEXT_PUBLIC_RELEASE_NAME');

  if (dsn) {
    Sentry.init({
      dsn,

      environment: appConfig.get('APP_ENVIRONMENT'),
      release,
      enabled: appConfig.get('NODE_ENV') === 'production',
      skipOpenTelemetrySetup: true,
      tracesSampleRate: 0.15,
      tracePropagationTargets: [/^\/api/, appConfig.get('API_URL')],
    });
  }

  registerOTel({
    serviceName: appConfig.get('SERVICE_NAME'),
    attributes: {
      env: appConfig.get('APP_ENVIRONMENT'),
      'service.name': appConfig.get('SERVICE_NAME'),
      'node.env': appConfig.get('NODE_ENV'),
    },
  });
}
