type LogLevel = 'debug' | 'info' | 'warning' | 'error';

type LogContext = {
  [key: string]: any;
};

const log = (level: LogLevel, message: string, context?: LogContext) => {
  const fnName = level === 'warning' ? 'warn' : level;

  console[fnName]({
    level,
    message,
    context: context || {},
    timestamp: new Date().toISOString(),
  });
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
