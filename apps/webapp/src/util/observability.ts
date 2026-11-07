import { trace } from '@opentelemetry/api';

/**
 * Error codes core-api sets in `extensions.code` for errors that are normal
 * user behaviour (not logged in, not allowed, not found, invalid input).
 * Keep in sync with `Lotta.Observability` in core-api.
 */
const EXPECTED_GRAPHQL_ERROR_CODES = new Set([
  'UNAUTHENTICATED',
  'FORBIDDEN',
  'HISEC_REQUIRED',
  'TENANT_NOT_FOUND',
  'NOT_FOUND',
  'BAD_USER_INPUT',
]);

/**
 * Most core-api errors are plain (German) messages without a code.
 * Same heuristic as core-api's `Lotta.Observability`.
 */
const EXPECTED_GRAPHQL_ERROR_MESSAGE =
  /nicht gefunden|existiert nicht|not found|keine? (nötigen )?Rechte|nicht die (nötigen )?Rechte|darfst|unauthori[sz]ed|forbidden|Falsche Zugangsdaten|ist geheim|ungültig|not valid|invalid/iu;

type GraphQLErrorLike = {
  message?: string;
  path?: ReadonlyArray<string | number>;
  extensions?: Record<string, unknown> | null;
};

export const isExpectedGraphQLError = (error: GraphQLErrorLike): boolean => {
  const code = error.extensions?.code;
  if (typeof code === 'string') {
    return EXPECTED_GRAPHQL_ERROR_CODES.has(code);
  }
  // Errors without a path are schema/validation errors: a bug, not user behaviour
  if (!error.path?.length) {
    return false;
  }
  return (
    typeof error.message === 'string' &&
    EXPECTED_GRAPHQL_ERROR_MESSAGE.test(error.message)
  );
};

// core-api records IDs as integers; use the same type so one TraceQL query
// (e.g. `{ span.tenant.id = 42 }`) matches spans of both services.
const idAttribute = (id: string | number) => {
  const numeric = Number(id);
  return Number.isSafeInteger(numeric) ? numeric : String(id);
};

/**
 * Put tenant information on the currently active span.
 * Only IDs and the slug are recorded, never personal data.
 */
export const setTenantSpanAttributes = (
  tenant: { id: string | number; slug?: string | null } | null | undefined
) => {
  if (!tenant) return;
  trace.getActiveSpan()?.setAttributes({
    'tenant.id': idAttribute(tenant.id),
    ...(tenant.slug ? { 'tenant.slug': tenant.slug } : {}),
  });
};

/**
 * Put the user's ID on the currently active span (`enduser.id` per the
 * OpenTelemetry semantic conventions, `user.id` for existing queries).
 */
export const setUserSpanAttributes = (
  user: { id: string | number } | null | undefined
) => {
  if (!user) return;
  const id = idAttribute(user.id);
  trace.getActiveSpan()?.setAttributes({ 'enduser.id': id, 'user.id': id });
};

/**
 * Trace context of the currently active span, for log correlation.
 */
export const getTraceContext = ():
  { trace_id: string; span_id: string } | Record<string, never> => {
  const spanContext = trace.getActiveSpan()?.spanContext();
  if (!spanContext || !trace.isSpanContextValid(spanContext)) {
    return {};
  }
  return { trace_id: spanContext.traceId, span_id: spanContext.spanId };
};

/**
 * Requests that are not worth a trace: static assets and health checks.
 */
const IGNORED_INCOMING_PATHS = [
  /^\/_next\/static\//,
  /^\/_next\/image/,
  /^\/favicon\.ico$/,
  /^\/robots\.txt$/,
  /^\/dbg\/health/,
];

export const isIgnoredIncomingRequest = (url: string | undefined) => {
  if (!url) return false;
  const pathname = url.split('?')[0];
  return IGNORED_INCOMING_PATHS.some((pattern) => pattern.test(pathname));
};
