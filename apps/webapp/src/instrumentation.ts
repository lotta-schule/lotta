import * as Sentry from '@sentry/nextjs';
import { registerOTel } from '@vercel/otel';
import { appConfig } from '#/config';
import { isIgnoredIncomingRequest } from '#/util/observability';

export const onRequestError = Sentry.captureRequestError;

export async function register() {
  const dsn = appConfig.get('NEXT_PUBLIC_SENTRY_DSN');
  const release = appConfig.get('NEXT_PUBLIC_RELEASE_NAME');

  if (!dsn) {
    console.warn('Sentry DSN not configured, error tracking disabled');
  }

  // Tracing first: the pino instrumentation must be registered before pino
  // is loaded, so that log lines get trace_id/span_id injected.
  await setupTracing();
  await setupLogging();

  if (dsn) {
    try {
      Sentry.init({
        dsn,

        environment: appConfig.get('APP_ENVIRONMENT'),
        release,
        enabled: appConfig.get('NODE_ENV') === 'production',
        // Users are school members, many of them minors: send no personal data
        sendDefaultPii: false,
        skipOpenTelemetrySetup: true,
      });
    } catch (error) {
      console.error('Sentry initialization failed:', error);
    }
  }

  // The Node.js runtime is traced by the NodeSDK in setupTracing. Only the
  // edge runtime (middleware) needs @vercel/otel; registering both in Node.js
  // made two tracer providers compete for the global registration.
  if (process.env.NEXT_RUNTIME === 'edge') {
    registerOTel({
      serviceName: appConfig.get('SERVICE_NAME'),
      attributes: {
        'deployment.environment': appConfig.get('APP_ENVIRONMENT'),
        'node.env': appConfig.get('NODE_ENV'),
      },
    });
  }
}

const setupLogging = async () => {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('pino');
    // @ts-expect-error - No types for this package
    await import('next-logger/presets/all');
    // next-logger creates its pino instance at level `debug`; only log
    // `info` and above unless LOG_LEVEL says otherwise. Same module instance
    // the presets above patched console and Next's logger with.
    // @ts-expect-error - No types for this package
    const { default: nextLogger } = await import('next-logger/lib/logger');
    nextLogger.level = process.env.LOG_LEVEL || 'info';
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
    const { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } =
      await import('@opentelemetry/semantic-conventions');

    const sdk = new NodeSDK({
      resource: resourceFromAttributes({
        [ATTR_SERVICE_NAME]: appConfig.get('SERVICE_NAME'),
        [ATTR_SERVICE_VERSION]: appConfig.get('NEXT_PUBLIC_RELEASE_NAME'),
        // Same key as core-api; the collector's tail sampler keeps all
        // staging/preview traces based on it.
        'deployment.environment': appConfig.get('APP_ENVIRONMENT'),
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
          '@opentelemetry/instrumentation-http': {
            ignoreIncomingRequestHook: (request) =>
              isIgnoredIncomingRequest(request.url),
          },
          // Injects trace_id/span_id into pino (next-logger) log lines.
          // Logs keep going to stdout only; no OTLP log export.
          '@opentelemetry/instrumentation-pino': { disableLogSending: true },
        }),
      ],
    });

    sdk.start();
  }
};
