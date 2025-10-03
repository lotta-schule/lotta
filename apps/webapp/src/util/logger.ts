import * as Sentry from '@sentry/nextjs';

type LogLevel = 'debug' | 'info' | 'warning' | 'error';

type LogContext = {
  [key: string]: any;
};

const addTraceContext = (context: LogContext = {}): LogContext => {
  const span = Sentry.getActiveSpan();
  if (span) {
    const { traceId, spanId } = span.spanContext();
    return {
      ...context,
      traceId,
      spanId,
    };
  }
  return context;
};

const log = (level: LogLevel, message: string, context?: LogContext) => {
  const enrichedContext = addTraceContext(context);

  Sentry.addBreadcrumb({
    level,
    message,
    data: enrichedContext,
  });

  const fnName = level === 'warning' ? 'warn' : level;

  console[fnName](message, enrichedContext);
};

export const Logger = {
  debug: (message: string, context?: LogContext) =>
    log('debug', message, context),
  info: (message: string, context?: LogContext) =>
    log('info', message, context),
  warn: (message: string, context?: LogContext) =>
    log('warning', message, context),
  error: (message: string, context?: LogContext) =>
    log('error', message, context),
};
