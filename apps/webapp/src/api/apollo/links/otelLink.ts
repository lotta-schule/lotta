import { ApolloLink, Observable } from '@apollo/client';
import {
  context,
  propagation,
  SpanKind,
  SpanStatusCode,
  trace,
} from '@opentelemetry/api';

const tracer = trace.getTracer('lotta-webapp-apollo');

export const createOtelLink = ({
  headers = {},
}: {
  headers?: Record<string, string | null | undefined>;
} = {}) =>
  new ApolloLink((operation, forward) => {
    const operationName = operation.operationName ?? 'anonymous';

    return new Observable((observer) => {
      const span = tracer.startSpan(`GraphQL: ${operationName}`, {
        kind: SpanKind.CLIENT,
        attributes: {
          'graphql.operation.name': operationName,
          // Lets you see the full query in Grafana for slow/failing requests
          'graphql.document': operation.query.loc?.source.body,
          ...Object.fromEntries(
            Object.entries(headers)
              .filter(([, value]) => value != null)
              .map(([key, value]) => [`http.request.header.${key}`, value])
          ),
        },
      });

      // Make this span active so the http instrumentation's axios span
      // becomes a child of it — this is what produces the nested tree
      const activeCtx = trace.setSpan(context.active(), span);

      // Explicitly inject W3C traceparent/tracestate into the request headers
      // so the receiving service can link its spans to this one.
      const propagationHeaders: Record<string, string> = {};
      propagation.inject(activeCtx, propagationHeaders);
      operation.setContext(
        ({
          headers: existingHeaders = {},
        }: {
          headers?: Record<string, string>;
        }) => ({
          headers: { ...existingHeaders, ...propagationHeaders },
        })
      );

      let sub: ReturnType<typeof forward>['subscribe'] extends (
        observer: any
      ) => infer R
        ? R
        : never;

      context.with(activeCtx, () => {
        sub = forward(operation).subscribe({
          next: (result) => {
            if (result.errors?.length) {
              span.setStatus({ code: SpanStatusCode.ERROR });
              span.setAttribute(
                'graphql.errors',
                JSON.stringify(result.errors)
              );
            }
            observer.next(result);
          },
          error: (err) => {
            span.setStatus({
              code: SpanStatusCode.ERROR,
              message: err.message,
            });
            span.end();
            observer.error(err);
          },
          complete: () => {
            span.end();
            observer.complete();
          },
        });
      });

      return () => sub?.unsubscribe();
    });
  });
