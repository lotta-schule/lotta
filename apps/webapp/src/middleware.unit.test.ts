import type { Mocked, MockedFunction } from 'vitest';
import type { NextRequest } from 'next/server';
import { sendRefreshRequest } from 'api/auth';
import { serialize } from 'cookie-es';
import { JWT } from 'util/auth/jwt';
import { middleware, config } from './middleware';

vi.mock('api/auth');
vi.mock('util/auth/jwt');

const mockSendRefreshRequest = sendRefreshRequest as MockedFunction<
  typeof sendRefreshRequest
>;
const mockJWT = JWT as Mocked<typeof JWT>;

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
    const expirationTime = new Date(Date.now() + 4 * 60 * 1000); // 4 minutes in the future
    const mockRefreshTokenJwt = {
      isValid: vi.fn().mockReturnValue(true),
      isExpired: vi.fn().mockReturnValue(false),
      body: {
        expires: expirationTime,
      },
    } as any as JWT;

    const mockNewTokens = {
      accessToken: 'newAccessToken',
      refreshToken: 'newRefreshToken',
    } as const;

    mockJWT.parse.mockReturnValue(mockRefreshTokenJwt);
    mockSendRefreshRequest.mockResolvedValue(mockNewTokens);

    const response = await middleware(mockRequest);

    expect(mockSendRefreshRequest).toHaveBeenCalledWith({
      'x-lotta-originary-host': 'mockHost',
      Cookie: serialize('SignInRefreshToken', 'mockRefreshToken', {
        sameSite: 'strict',
        secure: false,
        expires: expirationTime,
        httpOnly: true,
      }),
    });
    expect(response.cookies.get('SignInRefreshToken')?.value).toEqual(
      'newRefreshToken'
    );
    expect(response.cookies.get('SignInAccessToken')?.value).toEqual(
      'newAccessToken'
    );
  });

  it('should reset refresh token cookie if refresh token is missing or invalid', async () => {
    const mockRequest = createMockRequest(
      'http://test.lotta.schule/',
      { SignInRefreshToken: 'invalidRefreshToken' },
      { Authorization: 'Bearer validAccessToken' }
    );
    const mockRefreshTokenJwt = {
      isValid: vi.fn().mockReturnValue(false),
    } as unknown as JWT;
    const mockAccessTokenJwt = {
      isValid: vi.fn().mockReturnValue(true),
      isExpired: vi.fn().mockReturnValue(false),
    } as unknown as JWT;

    mockJWT.parse.mockImplementation((token) => {
      if (token === 'invalidRefreshToken') {
        return mockRefreshTokenJwt;
      }
      return mockAccessTokenJwt;
    });

    const response = await middleware(mockRequest);

    const refreshTokenExpiration =
      response.cookies.get('SignInRefreshToken')?.expires;
    expect((refreshTokenExpiration as Date).getTime()).toEqual(0);
    expect(response.cookies.has('SignInAccessToken')).toEqual(false);
  });

  it('should handle expired access token', async () => {
    const mockRequest = createMockRequest(
      'http://test.lotta.schule/',
      {},
      { Authorization: 'Bearer expiredAccessToken' }
    );
    const mockAccessTokenJwt = {
      isValid: vi.fn().mockReturnValue(true),
      isExpired: vi.fn().mockReturnValue(true),
    } as any as JWT;

    mockJWT.parse.mockReturnValue(mockAccessTokenJwt);

    const response = await middleware(mockRequest);

    expect(response.cookies.has('SignInAccessToken')).toEqual(false);
  });

  it('should renew tokens when refresh token is valid and not close to expiration, but no access token is present', async () => {
    const mockRequest = createMockRequest(
      'http://test.lotta.schule/',
      { SignInRefreshToken: 'mockRefreshToken' },
      { host: 'mockHost' }
    );
    const expirationTime = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes in the future
    const mockRefreshTokenJwt = {
      isValid: vi.fn().mockReturnValue(true),
      isExpired: vi.fn().mockReturnValue(false),
      body: {
        expires: expirationTime,
      },
    } as any as JWT;

    const mockNewTokens = {
      accessToken: 'newAccessToken',
      refreshToken: 'newRefreshToken',
    } as const;

    mockJWT.parse.mockReturnValue(mockRefreshTokenJwt);
    mockSendRefreshRequest.mockResolvedValue(mockNewTokens);

    const response = await middleware(mockRequest);

    expect(mockSendRefreshRequest).toHaveBeenCalledWith({
      'x-lotta-originary-host': 'mockHost',
      Cookie: serialize('SignInRefreshToken', 'mockRefreshToken', {
        sameSite: 'strict',
        secure: false,
        expires: expirationTime,
        httpOnly: true,
      }),
    });
    expect(response.cookies.get('SignInRefreshToken')?.value).toEqual(
      'newRefreshToken'
    );
    expect(response.cookies.get('SignInAccessToken')?.value).toEqual(
      'newAccessToken'
    );
  });

  it('should not renew tokens when refresh token is valid and not close to expiration, and access token is present', async () => {
    const mockRequest = createMockRequest(
      'http://test.lotta.schule/',
      {
        SignInRefreshToken: 'mockRefreshToken',
        SignInAccessToken: 'mockAccessToken',
      },
      { host: 'mockHost' }
    );
    const expirationTime = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes in the future
    const mockRefreshTokenJwt = {
      isValid: vi.fn().mockReturnValue(true),
      isExpired: vi.fn().mockReturnValue(false),
      body: {
        expires: expirationTime,
      },
    } as any as JWT;
    const mockAccessTokenJwt = {
      body: {
        expires: expirationTime,
      },
    } as any as JWT;

    mockJWT.parse.mockImplementation((token) => {
      if (token === 'mockRefreshToken') {
        return mockRefreshTokenJwt;
      }
      return mockAccessTokenJwt;
    });

    const response = await middleware(mockRequest);

    expect(mockSendRefreshRequest).not.toHaveBeenCalled();
    expect(response.cookies.get('SignInRefreshToken')?.value).toEqual(
      'mockRefreshToken'
    );
    expect(response.cookies.get('SignInAccessToken')?.value).toEqual(
      'mockAccessToken'
    );
  });
});

describe('config', () => {
  it('should have the correct matcher', () => {
    expect(config.matcher).toEqual([
      {
        source:
          '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|p/|stry/|api/|backend/|auth/storage/).*)',
      },
    ]);
  });
});
