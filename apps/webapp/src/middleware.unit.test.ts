import type { MockedFunction } from 'vitest';
import type { NextRequest } from 'next/server.js';
import { sendRefreshRequest } from '#/api/auth.js';
import { middleware } from './middleware.js';

vi.mock('#/api/auth.js');

const mockSendRefreshRequest = sendRefreshRequest as MockedFunction<
  typeof sendRefreshRequest
>;

describe('middleware', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  const createMockRequest = (
    url: string,
    cookies: Record<string, string> = {},
    headers: Record<string, string> = {}
  ) => {
    const headersObj = new Headers();
    Object.entries(headers).forEach(([key, value]) => {
      headersObj.set(key, value);
    });

    return {
      cookies: {
        get: (key: string) => ({ value: cookies[key] }),
      },
      headers: headersObj,
      url,
      nextUrl: URL.parse(url),
    } as unknown as NextRequest;
  };

  it('should update tokens if refresh token is valid and close to expiration', async () => {
    const mockRequest = createMockRequest(
      'http://test.lotta.schule/',
      { SignInRefreshToken: 'mockRefreshToken' },
      { host: 'mockHost' }
    );

    const mockNewTokens = {
      accessToken: 'newAccessToken',
      refreshToken: 'newRefreshToken',
      tenant: 'slug:test',
    } as const;

    mockSendRefreshRequest.mockResolvedValue(mockNewTokens);

    const response = await middleware(mockRequest);

    expect(mockSendRefreshRequest).toHaveBeenCalledWith(
      { host: 'mockHost' },
      'mockRefreshToken',
      'http://localhost:4000'
    );
    expect(response.cookies.get('SignInRefreshToken')?.value).toEqual(
      'newRefreshToken'
    );
    expect(response.cookies.get('SignInAccessToken')?.value).toEqual(
      'newAccessToken'
    );
  });

  it('should not set token cookies when refresh fails', async () => {
    const mockRequest = createMockRequest(
      'http://test.lotta.schule/',
      { SignInRefreshToken: 'invalidRefreshToken' },
      { host: 'mockHost' }
    );

    mockSendRefreshRequest.mockResolvedValue({
      accessToken: null,
      refreshToken: null,
      tenant: null,
    });

    const response = await middleware(mockRequest);

    expect(response.cookies.has('SignInAccessToken')).toEqual(false);
    expect(response.cookies.has('SignInRefreshToken')).toEqual(false);
  });

  it('should handle expired access token', async () => {
    const mockRequest = createMockRequest(
      'http://test.lotta.schule/',
      {},
      { Authorization: 'Bearer expiredAccessToken' }
    );

    const response = await middleware(mockRequest);

    expect(response.cookies.has('SignInAccessToken')).toEqual(false);
  });

  it('should renew tokens when refresh token is present but no access token cookie', async () => {
    const mockRequest = createMockRequest(
      'http://test.lotta.schule/',
      { SignInRefreshToken: 'mockRefreshToken' },
      { host: 'mockHost' }
    );

    const mockNewTokens = {
      accessToken: 'newAccessToken',
      refreshToken: 'newRefreshToken',
      tenant: 'slug:test',
    } as const;

    mockSendRefreshRequest.mockResolvedValue(mockNewTokens);

    const response = await middleware(mockRequest);

    expect(mockSendRefreshRequest).toHaveBeenCalledWith(
      { host: 'mockHost' },
      'mockRefreshToken',
      'http://localhost:4000'
    );
    expect(response.cookies.get('SignInRefreshToken')?.value).toEqual(
      'newRefreshToken'
    );
    expect(response.cookies.get('SignInAccessToken')?.value).toEqual(
      'newAccessToken'
    );
  });

  it('should renew tokens even when access token cookie is already present', async () => {
    const mockRequest = createMockRequest(
      'http://test.lotta.schule/',
      {
        SignInRefreshToken: 'mockRefreshToken',
        SignInAccessToken: 'mockAccessToken',
      },
      { host: 'mockHost' }
    );

    const mockNewTokens = {
      accessToken: 'newAccessToken',
      refreshToken: 'newRefreshToken',
      tenant: 'slug:test',
    } as const;

    mockSendRefreshRequest.mockResolvedValue(mockNewTokens);

    const response = await middleware(mockRequest);

    expect(mockSendRefreshRequest).toHaveBeenCalledWith(
      { host: 'mockHost' },
      'mockRefreshToken',
      'http://localhost:4000'
    );
    expect(response.cookies.get('SignInRefreshToken')?.value).toEqual(
      'newRefreshToken'
    );
    expect(response.cookies.get('SignInAccessToken')?.value).toEqual(
      'newAccessToken'
    );
  });
});
