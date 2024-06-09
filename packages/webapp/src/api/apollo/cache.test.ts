import { InMemoryCache } from '@apollo/client';
import { isMobileDrawerOpenVar, createCache } from './cache';

describe('Apollo Client Cache', () => {
  beforeEach(() => {
    isMobileDrawerOpenVar(false);
  });

  it('should initialize the reactive variable to false', () => {
    expect(isMobileDrawerOpenVar()).toBe(false);
  });

  it('should create a cache', () => {
    const cache = createCache();

    expect(cache).toBeInstanceOf(InMemoryCache);
  });
});
