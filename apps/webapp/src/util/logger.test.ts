import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as Sentry from '@sentry/nextjs';
import { Logger } from './logger';

vi.mock('@sentry/nextjs', () => ({
  getActiveSpan: vi.fn(),
  addBreadcrumb: vi.fn(),
}));

describe('logger', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'debug').mockImplementation(() => {});
    vi.spyOn(console, 'info').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('adds breadcrumb with trace context when span is active', () => {
    const mockSpan = {
      spanContext: () => ({
        traceId: '1234567890abcdef',
        spanId: 'abcdef123456',
      }),
    };
    vi.mocked(Sentry.getActiveSpan).mockReturnValue(mockSpan as any);

    Logger.info('test message', { extra: 'data' });

    expect(Sentry.addBreadcrumb).toHaveBeenCalledWith({
      level: 'info',
      message: 'test message',
      data: {
        extra: 'data',
        traceId: '1234567890abcdef',
        spanId: 'abcdef123456',
      },
    });
  });

  it('adds breadcrumb without trace context when no span is active', () => {
    vi.mocked(Sentry.getActiveSpan).mockReturnValue(undefined);

    Logger.warn('warning message');

    expect(Sentry.addBreadcrumb).toHaveBeenCalledWith({
      level: 'warning',
      message: 'warning message',
      data: {},
    });
  });

  it('logs to console at appropriate level', () => {
    vi.mocked(Sentry.getActiveSpan).mockReturnValue(undefined);

    Logger.debug('debug msg');
    Logger.info('info msg');
    Logger.warn('warn msg');
    Logger.error('error msg');

    expect(console.debug).toHaveBeenCalledWith('debug msg', {});
    expect(console.info).toHaveBeenCalledWith('info msg', {});
    expect(console.warn).toHaveBeenCalledWith('warn msg', {});
    expect(console.error).toHaveBeenCalledWith('error msg', {});
  });
});
