import { describe, it, expect } from 'vitest';
import { isExternalUrl } from './isExternalUrl';

describe('isExternalUrl', () => {
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
});
