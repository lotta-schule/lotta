import * as Sentry from '@sentry/nextjs';
import { appConfig } from '#/config';

export const onRequestError = Sentry.captureRequestError;

export async function register() {
  const dsn = appConfig.get('NEXT_PUBLIC_SENTRY_DSN');
  const release = appConfig.get('NEXT_PUBLIC_RELEASE_NAME');

  if (!dsn) {
    console.warn('Sentry DSN not configured, error tracking disabled');
  }

  await Promise.all([setupLogging(), setupTracing()]);

  if (dsn) {
    try {
      Sentry.init({
        dsn,

        environment: appConfig.get('APP_ENVIRONMENT'),
        release,
        enabled: appConfig.get('NODE_ENV') === 'production',
        skipOpenTelemetrySetup: true,
      });
    } catch (error) {
      console.error('Sentry initialization failed:', error);
    }
  }
}

const setupLogging = async () => {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('pino');
    // @ts-expect-error - No types for this package
    await import('next-logger/presets/all');
  }
};

const setupTracing = async () => {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { NodeSDK } = await import('@opentelemetry/sdk-node');
    const { OTLPTraceExporter } =
      await import('@opentelemetry/exporter-trace-otlp-http');
    const { OTLPMetricExporter } =
      await import('@opentelemetry/exporter-metrics-otlp-http');
    const { PeriodicExportingMetricReader } =
      await import('@opentelemetry/sdk-metrics');
    const { getNodeAutoInstrumentations } =
      await import('@opentelemetry/auto-instrumentations-node');
    const { resourceFromAttributes } = await import('@opentelemetry/resources');
    const {
      ATTR_SERVICE_NAME,
      ATTR_SERVICE_VERSION,
      SEMRESATTRS_DEPLOYMENT_ENVIRONMENT,
    } = await import('@opentelemetry/semantic-conventions');

    const sdk = new NodeSDK({
      resource: resourceFromAttributes({
        [ATTR_SERVICE_NAME]: appConfig.get('SERVICE_NAME'),
        [ATTR_SERVICE_VERSION]: appConfig.get('NEXT_PUBLIC_RELEASE_NAME'),
        [SEMRESATTRS_DEPLOYMENT_ENVIRONMENT]: appConfig.get('APP_ENVIRONMENT'),
      }),
      traceExporter: new OTLPTraceExporter(),
      metricReader: new PeriodicExportingMetricReader({
        exporter: new OTLPMetricExporter(),
      }),
      instrumentations: [
        getNodeAutoInstrumentations({
          // File system instrumentation is extremely noisy in Next.js, skip it
          '@opentelemetry/instrumentation-fs': { enabled: false },
          // DNS is also noisy and rarely actionable
          '@opentelemetry/instrumentation-dns': { enabled: false },
        }),
      ],
    });

    sdk.start();
  }
};
