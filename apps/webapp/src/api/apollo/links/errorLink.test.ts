import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createErrorLink } from './errorLink';

describe('createErrorLink', () => {
  const consoleErrorSpy = vi.spyOn(console, 'error');

  beforeEach(() => {
    consoleErrorSpy.mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('should log GraphQL errors to the console', () => {
    const errorLink = createErrorLink();
    const graphQLErrors = [
      {
        message: 'Test GraphQL error',
        locations: [{ line: 1, column: 2 }],
        path: ['testPath'],
      },
    ];

    expect(() =>
      (errorLink as any).onError({ graphQLErrors, networkError: null })
    ).toThrowErrorMatchingSnapshot();
  });

  it('should log network errors to the console', () => {
    const errorLink = createErrorLink();
    const networkError = new Error('Test Network error');

    expect(() =>
      (errorLink as any).onError({ graphQLErrors: null, networkError })
    ).toThrowErrorMatchingSnapshot();
  });

  it('should handle both GraphQL and network errors', () => {
    const errorLink = createErrorLink();
    const graphQLErrors = [
      {
        message: 'Test GraphQL error',
        locations: [{ line: 1, column: 2 }],
        path: ['testPath'],
      },
    ];
    const networkError = new Error('Test Network error');

    expect(() =>
      (errorLink as any).onError({ graphQLErrors, networkError })
    ).toThrowErrorMatchingSnapshot();
  });
});
