import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Logger } from './logger';

describe('logger', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'debug').mockImplementation(() => {});
    vi.spyOn(console, 'info').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('logs to console at appropriate level', () => {
    Logger.debug('debug msg');
    Logger.info('info msg');
    Logger.warn('warn msg');
    Logger.error('error msg');

    expect(console.debug).toHaveBeenCalledWith({
      level: 'debug',
      message: 'debug msg',
      context: {},
      timestamp: expect.any(String),
    });
    expect(console.info).toHaveBeenCalledWith({
      level: 'info',
      message: 'info msg',
      context: {},
      timestamp: expect.any(String),
    });
    expect(console.warn).toHaveBeenCalledWith({
      level: 'warning',
      message: 'warn msg',
      context: {},
      timestamp: expect.any(String),
    });
    expect(console.error).toHaveBeenCalledWith({
      level: 'error',
      message: 'error msg',
      context: {},
      timestamp: expect.any(String),
    });
  });
});
