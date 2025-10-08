import { ApolloLink } from '@apollo/client';
import * as Sentry from '@sentry/nextjs';

export const createSentryTracingLink = () =>
  new ApolloLink((operation, forward) => {
    const span = Sentry.getActiveSpan();
    const trace = Sentry.getTraceData({ span });
    if (span) {
      const { traceId, spanId } = span.spanContext();
      const baggage = trace?.baggage;

      operation.setContext(({ headers = {} }) => ({
        headers: {
          ...headers,
          'sentry-trace': `${traceId}-${spanId}`,
          ...(baggage ? { baggage } : {}),
        },
      }));
    }

    return forward(operation);
  });
