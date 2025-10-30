import { describe, it, expect, beforeEach } from 'vitest';
import { isExternalUrl } from './isExternalUrl';

describe('isExternalUrl', () => {
  beforeEach(() => {
    // Mock window.location for browser context
    delete (global as any).window;
    (global as any).window = {
      location: {
        host: 'lotta-gymnasium.lotta.schule',
      },
    };
  });

  it('should return false for relative URLs starting with /', () => {
    expect(isExternalUrl('/path/to/page')).toBe(false);
    expect(isExternalUrl('/c/category-id')).toBe(false);
  });

  it('should return true for absolute URLs with http protocol', () => {
    expect(isExternalUrl('http://example.com')).toBe(true);
    expect(isExternalUrl('http://example.com/path')).toBe(true);
  });

  it('should return true for absolute URLs with https protocol', () => {
    expect(isExternalUrl('https://example.com')).toBe(true);
    expect(isExternalUrl('https://lotta.schule')).toBe(true);
    expect(isExternalUrl('https://google.com')).toBe(true);
  });

  it('should return false for relative URLs without leading slash', () => {
    expect(isExternalUrl('path/to/page')).toBe(false);
    expect(isExternalUrl('category-id')).toBe(false);
  });

  it('should return false for same-host absolute URLs', () => {
    expect(isExternalUrl('https://lotta-gymnasium.lotta.schule/path')).toBe(
      false
    );
    expect(isExternalUrl('http://lotta-gymnasium.lotta.schule')).toBe(false);
  });
});
