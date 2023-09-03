const OpenTelemetryNode = require('@opentelemetry/sdk-node');
const OpentelemetryExporterTraceHttp = require('@opentelemetry/exporter-trace-otlp-http');
const OpenTelemetryResources = require('@opentelemetry/resources');
const OpenTelemetrySemanticConventions = require('@opentelemetry/semantic-conventions');
const OpenTelemetryInstrumentationHttp = require('@opentelemetry/instrumentation-http');
const OpenTelemetryInstrumentationFetch = require('@opentelemetry/instrumentation-fetch');
const OpenTelemetryInstrumentationConnect = require('@opentelemetry/instrumentation-connect');

const { SemanticResourceAttributes } = OpenTelemetrySemanticConventions;
const { Resource } = OpenTelemetryResources;
const { OTLPTraceExporter } = OpentelemetryExporterTraceHttp;
const { NodeSDK } = OpenTelemetryNode;
const { HttpInstrumentation } = OpenTelemetryInstrumentationHttp;
const { FetchInstrumentation } = OpenTelemetryInstrumentationFetch;
const { ConnectInstrumentation } = OpenTelemetryInstrumentationConnect;

// configure the SDK to export telemetry data to the console
// enable all auto-instrumentations from the meta package
const exporterOptions = {
  url: 'http://tempo.monitoring:4318/v1/traces',
};
const traceExporter = new OTLPTraceExporter(exporterOptions);
const sdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]:
      process.env.SERVICE_NAME || 'web',
    [SemanticResourceAttributes.SERVICE_NAMESPACE]:
      process.env.SERVICE_NAMESPACE,
    [SemanticResourceAttributes.CONTAINER_IMAGE_NAME]: (
      process.env.IMAGE_NAME ?? ''
    ).split(':')[0],
    [SemanticResourceAttributes.CONTAINER_IMAGE_TAG]: (
      process.env.IMAGE_NAME ?? ''
    ).split(':')[1],
  }),
  traceExporter,
  instrumentations: [
    new HttpInstrumentation({
      ignoreIncomingRequestHook: (req) => {
        return req.url.match(
          /\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|map|json)$/i
        );
      },
    }),
    new ConnectInstrumentation(),
    new FetchInstrumentation(),
  ],
});

// gracefully shut down the SDK on process exit
process.on('SIGTERM', () => {
  sdk
    .shutdown()
    .then(() => console.log('Tracing terminated'))
    .catch((error) => console.log('Error terminating tracing', error))
    .finally(() => process.exit(0));
});
