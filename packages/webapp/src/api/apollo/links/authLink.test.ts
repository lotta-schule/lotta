import { Mock } from 'vitest';
import { Observable, Operation, FetchResult } from '@apollo/client';
import { waitFor } from '@testing-library/react';
import { createAuthLink } from './authLink';

class MockObserver {
  next = vi.fn();
  error = vi.fn();
  complete = vi.fn();
}

describe('createAuthLink', () => {
  let requestTokenMock: Mock;
  let operation: Operation;
  let forward: Mock;

  beforeEach(() => {
    requestTokenMock = vi.fn();
    operation = {
      setContext: vi.fn(),
      getContext: vi.fn().mockReturnValue({ headers: {} }),
    } as unknown as Operation;
    forward = vi.fn(() => new Observable<FetchResult>(() => {}));
  });

  it('should add authorization header if token is provided', async () => {
    requestTokenMock.mockResolvedValue('test-token');
    const authLink = createAuthLink({ requestToken: requestTokenMock });

    const subscription = authLink
      .request(operation, forward)!
      .subscribe(new MockObserver());

    await waitFor(() => {
      expect(operation.setContext).toHaveBeenCalledWith({
        headers: { authorization: 'Bearer test-token' },
      });
    });
    expect(forward).toHaveBeenCalledWith(operation);

    subscription.unsubscribe();
  });

  it('should not add authorization header if token is not provided', async () => {
    requestTokenMock.mockResolvedValue(null);
    const authLink = createAuthLink({ requestToken: requestTokenMock });

    const subscription = authLink
      .request(operation, forward)!
      .subscribe(new MockObserver());

    await waitFor(() => {
      expect(operation.setContext).toHaveBeenCalledWith({
        headers: {},
      });
    });
    expect(forward).toHaveBeenCalledWith(operation);

    subscription.unsubscribe();
  });

  it('should handle errors from requestToken', async () => {
    const error = new Error('Request token error');
    requestTokenMock.mockRejectedValue(error);
    const authLink = createAuthLink({ requestToken: requestTokenMock });

    const observer = new MockObserver();
    const subscription = authLink
      .request(operation, forward)!
      .subscribe(observer);

    await waitFor(() => {
      expect(observer.error).toHaveBeenCalledWith(error);
    });

    subscription.unsubscribe();
  });
});
