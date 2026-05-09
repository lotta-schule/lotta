import { ApolloLink, Observable } from '@apollo/client';
import { context, SpanKind, SpanStatusCode, trace } from '@opentelemetry/api';

const tracer = trace.getTracer('lotta-webapp-apollo');

export const createOtelLink = () =>
  new ApolloLink((operation, forward) => {
    const operationName = operation.operationName ?? 'anonymous';

    return new Observable((observer) => {
      const span = tracer.startSpan(`GraphQL: ${operationName}`, {
        kind: SpanKind.CLIENT,
        attributes: {
          'graphql.operation.name': operationName,
          // Lets you see the full query in Grafana for slow/failing requests
          'graphql.document': operation.query.loc?.source.body,
        },
      });

      // Make this span active so the http instrumentation's axios span
      // becomes a child of it — this is what produces the nested tree
      const activeCtx = trace.setSpan(context.active(), span);

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
