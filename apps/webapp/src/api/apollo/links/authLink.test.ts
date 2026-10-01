import { Mock } from 'vitest';
import { Observable, ApolloLink } from '@apollo/client';
import { waitFor } from '@testing-library/react';
import { createAuthLink } from './authLink';

class MockObserver {
  next = vi.fn();
  error = vi.fn();
  complete = vi.fn();
}

describe('createAuthLink', () => {
  let operation: ApolloLink.Operation;
  let forward: Mock;

  const initialToken = 'test-token';

  beforeEach(() => {
    operation = {
      setContext: vi.fn((fn) => fn({ headers: {} })),
      getContext: vi.fn().mockReturnValue({ headers: {} }),
    } as unknown as ApolloLink.Operation;
    forward = vi.fn(() => new Observable<ApolloLink.Result>(() => {}));
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should add authorization header if token is provided', async () => {
    const authLink = createAuthLink({ initialToken });

    const subscription = authLink
      .request(operation, forward)!
      .subscribe(new MockObserver());

    await waitFor(() => {
      expect(operation.setContext).toHaveBeenCalled();
    });
    expect(forward).toHaveBeenCalledWith(operation);

    subscription.unsubscribe();
  });

  it('should not add authorization header if token is not provided', async () => {
    const authLink = createAuthLink({});

    const subscription = authLink
      .request(operation, forward)!
      .subscribe(new MockObserver());

    await waitFor(() => {
      expect(operation.setContext).not.toHaveBeenCalled();
    });
    expect(forward).toHaveBeenCalledWith(operation);

    subscription.unsubscribe();
  });
});
