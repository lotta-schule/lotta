import { Mock, MockedFunction } from 'vitest';
import { Observable, Operation, FetchResult } from '@apollo/client';
import { waitFor } from '@testing-library/react';
import { createAuthLink } from './authLink';
import { isBrowser } from 'util/isBrowser';
import { jwtDecode } from 'jwt-decode';

class MockObserver {
  next = vi.fn();
  error = vi.fn();
  complete = vi.fn();
}

vi.mock('util/isBrowser');
vi.mock('jwt-decode');
const isBrowserMock = isBrowser as MockedFunction<typeof isBrowser>;
const jwtDecodeMock = jwtDecode as MockedFunction<typeof jwtDecode>;

describe('createAuthLink', () => {
  let sendRefreshTokenRequestMock: Mock;
  let operation: Operation;
  let forward: Mock;

  const initialToken = 'test-token';

  beforeEach(() => {
    sendRefreshTokenRequestMock = vi.fn();
    operation = {
      setContext: vi.fn(),
      getContext: vi.fn().mockReturnValue({ headers: {} }),
    } as unknown as Operation;
    forward = vi.fn(() => new Observable<FetchResult>(() => {}));
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should add authorization header if token is provided', async () => {
    const authLink = createAuthLink({ initialToken });
    isBrowserMock.mockReturnValue(false);
    jwtDecodeMock.mockReturnValue({ exp: Date.now() / 1000 - 3600 });

    const subscription = authLink
      .request(operation, forward)!
      .subscribe(new MockObserver());

    await waitFor(() => {
      expect(operation.setContext).toHaveBeenCalledWith({
        accessToken: 'test-token',
        headers: { authorization: 'Bearer test-token' },
      });
    });
    expect(forward).toHaveBeenCalledWith(operation);

    subscription.unsubscribe();
  });

  it('should not add authorization header if token is not provided', async () => {
    sendRefreshTokenRequestMock.mockResolvedValue(null);
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

  it('should handle errors from requestToken', async () => {
    jwtDecodeMock.mockReturnValue({ exp: Date.now() / 1000 - 3600 });
    const error = new Error('Invalid token specified: missing part #2');
    sendRefreshTokenRequestMock.mockRejectedValue(error);
    const authLink = createAuthLink({
      initialToken,
      sendRefreshTokenRequest: sendRefreshTokenRequestMock,
    });

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
