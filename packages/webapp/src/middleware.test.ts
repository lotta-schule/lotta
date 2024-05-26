import { Mocked, MockedFunction } from 'vitest';
import { sendRefreshRequest } from 'api/auth';
import { type NextRequest } from 'next/server';
import { middleware, config } from './middleware';
import { JWT } from 'util/auth/jwt';

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
    cookies: Record<string, string> = {},
    headers: Record<string, string> = {}
  ) =>
    ({
      cookies: {
        get: (key: string) => ({ value: cookies[key] }),
      },
      headers: {
        get: (key: string) => headers[key],
      },
    }) as unknown as NextRequest;

  it('should update tokens if refresh token is valid and close to expiration', async () => {
    const mockRequest = createMockRequest(
      { SignInRefreshToken: 'mockRefreshToken' },
      { host: 'mockHost' }
    );
    const mockRefreshTokenJwt = {
      isValid: vi.fn().mockReturnValue(true),
      body: {
        expires: new Date(Date.now() + 4 * 60 * 1000), // 4 minutes in the future
      },
    } as any as JWT;

    const mockNewTokens = {
      accessToken: 'newAccessToken',
      refreshToken: 'newRefreshToken',
    } as const;

    mockJWT.parse.mockReturnValue(mockRefreshTokenJwt);
    mockSendRefreshRequest.mockResolvedValue(mockNewTokens);

    const response = await middleware(mockRequest);

    expect(mockSendRefreshRequest).toHaveBeenCalledWith('mockRefreshToken', {
      'x-lotta-originary-host': 'mockHost',
    });
    expect(response.cookies.get('SigninRefreshToken')?.value).toEqual(
      'newRefreshToken'
    );
    expect(response.cookies.get('SigninAccessToken')?.value).toEqual(
      'newAccessToken'
    );
  });

  it('should not update tokens if refresh token is missing or invalid', async () => {
    const mockRequest = createMockRequest(
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

    expect(response.cookies.has('SigninRefreshToken')).toEqual(false);
    expect(response.cookies.has('SigninAccessToken')).toEqual(false);
  });

  it('should handle expired access token', async () => {
    const mockRequest = createMockRequest(
      {},
      { Authorization: 'Bearer expiredAccessToken' }
    );
    const mockAccessTokenJwt = {
      isValid: vi.fn().mockReturnValue(true),
      isExpired: vi.fn().mockReturnValue(true),
    } as any as JWT;

    mockJWT.parse.mockReturnValue(mockAccessTokenJwt);

    const response = await middleware(mockRequest);

    expect(response.cookies.has('SigninAccessToken')).toEqual(false);
  });
});

describe('config', () => {
  it('should have the correct matcher', () => {
    expect(config.matcher).toEqual([
      '/((?!_next/static|_next/image|font|favicon.ico|p/).*)',
      '/(.*).svg',
    ]);
  });
});
