import type { MockedFunction } from 'vitest';
import type { NextRequest } from 'next/server.js';
import { NextResponse } from 'next/server.js';
import { sendRefreshRequest } from '#/api/auth.js';
import { middleware } from './middleware.js';

vi.mock('#/api/auth.js');
vi.mock('#/config.js', () => ({
  appConfig: {
    get: vi.fn((key: string) => {
      if (key === 'API_URL') return 'http://api.example.com';
      return '';
    }),
  },
}));
vi.mock('next/server.js', () => ({
  NextResponse: {
    rewrite: vi.fn(),
    next: vi.fn(),
  },
}));

const mockSendRefreshRequest = sendRefreshRequest as MockedFunction<
  typeof sendRefreshRequest
>;
const mockNextResponseRewrite = vi.mocked(NextResponse.rewrite);
const mockNextResponseNext = vi.mocked(NextResponse.next);

const createToken = (
  overrides: {
    exp?: number;
    typ?: 'access' | 'refresh' | 'high_security';
    tid?: string;
  } = {}
) => {
  const now = Math.floor(Date.now() / 1000);
  const header = btoa(JSON.stringify({ alg: 'HS512', typ: 'JWT' }));
  const body = btoa(
    JSON.stringify({
      aud: 'lotta',
      iss: 'lotta-server',
      jid: 'test-jwt-id',
      sub: 'user-123',
      exp: overrides.exp ?? now + 3600,
      nbf: now - 10,
      iat: now - 10,
      typ: overrides.typ ?? 'access',
      tid: overrides.tid ?? 'test-tenant-id',
    })
  );
  return `${header}.${body}.fakesignature`;
};

describe('middleware', () => {
  let mockCookiesSet: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.resetAllMocks();
    mockCookiesSet = vi.fn();
    mockNextResponseNext.mockReturnValue({
      cookies: { set: mockCookiesSet },
    } as any);
    mockNextResponseRewrite.mockReturnValue({
      cookies: { set: mockCookiesSet },
    } as any);
  });

  const createMockRequest = (
    url: string,
    cookies: Record<string, string> = {},
    headers: Record<string, string> = {}
  ) => {
    const parsedUrl = new URL(url);
    const headersObj = new Headers();
    Object.entries(headers).forEach(([key, value]) => {
      headersObj.set(key, value);
    });

    return {
      cookies: {
        get: (key: string) =>
          cookies[key] !== undefined ? { value: cookies[key] } : undefined,
      },
      headers: headersObj,
      url,
      nextUrl: {
        pathname: parsedUrl.pathname,
        host: parsedUrl.host,
        clone: () => new URL(url),
      },
    } as unknown as NextRequest;
  };

  describe('API route proxying', () => {
    it.each([
      ['/api', 'exact /api path'],
      ['/auth/login', '/auth/* prefix'],
      ['/storage/file.jpg', '/storage/* prefix'],
      ['/data/resource', '/data/* prefix'],
      ['/setup/wizard', '/setup/* prefix'],
    ])('rewrites %s (%s) to the API host', async (path) => {
      const request = createMockRequest(`http://localhost:3000${path}`);
      await middleware(request);
      expect(mockNextResponseRewrite).toHaveBeenCalledWith(
        expect.objectContaining({ hostname: 'api.example.com' })
      );
      expect(mockNextResponseNext).not.toHaveBeenCalled();
    });
  });

  describe('static asset passthrough', () => {
    it.each([
      '/_next/static/chunk.js',
      '/_next/image/photo.jpg',
      '/favicon.ico',
      '/sitemap.xml',
      '/robots.txt',
      '/p/some-article',
    ])('passes %s through without token processing', async (path) => {
      const request = createMockRequest(`http://localhost:3000${path}`);
      await middleware(request);
      expect(mockNextResponseNext).toHaveBeenCalled();
      expect(mockNextResponseRewrite).not.toHaveBeenCalled();
      expect(mockSendRefreshRequest).not.toHaveBeenCalled();
    });
  });

  describe('token refresh is skipped', () => {
    it('passes through when no cookies are present', async () => {
      const request = createMockRequest('http://localhost:3000/dashboard');
      await middleware(request);
      expect(mockNextResponseNext).toHaveBeenCalled();
      expect(mockSendRefreshRequest).not.toHaveBeenCalled();
    });

    it('passes through when there is no refresh token', async () => {
      const accessToken = createToken({
        exp: Math.floor(Date.now() / 1000) - 60,
      });
      const request = createMockRequest('http://localhost:3000/dashboard', {
        SignInAccessToken: accessToken,
      });
      await middleware(request);
      expect(mockNextResponseNext).toHaveBeenCalled();
      expect(mockSendRefreshRequest).not.toHaveBeenCalled();
    });

    it('passes through when access token is not close to expiration', async () => {
      const accessToken = createToken({
        exp: Math.floor(Date.now() / 1000) + 3600,
      });
      const request = createMockRequest('http://localhost:3000/dashboard', {
        SignInAccessToken: accessToken,
        SignInRefreshToken: 'valid-refresh-token',
      });
      await middleware(request);
      expect(mockNextResponseNext).toHaveBeenCalled();
      expect(mockSendRefreshRequest).not.toHaveBeenCalled();
    });

    it('passes through when access token type is high_security', async () => {
      const accessToken = createToken({
        exp: Math.floor(Date.now() / 1000) - 60,
        typ: 'high_security',
      });
      const request = createMockRequest('http://localhost:3000/dashboard', {
        SignInAccessToken: accessToken,
        SignInRefreshToken: 'valid-refresh-token',
      });
      await middleware(request);
      expect(mockNextResponseNext).toHaveBeenCalled();
      expect(mockSendRefreshRequest).not.toHaveBeenCalled();
    });
  });

  describe('token refresh is performed', () => {
    it('calls sendRefreshRequest with tokens and API URL when access token is expired', async () => {
      const accessToken = createToken({
        exp: Math.floor(Date.now() / 1000) - 60,
      });
      const refreshToken = 'incoming-refresh-token';
      mockSendRefreshRequest.mockResolvedValue({
        accessToken: null,
        refreshToken: null,
        tenant: null,
      });
      const request = createMockRequest('http://localhost:3000/dashboard', {
        SignInAccessToken: accessToken,
        SignInRefreshToken: refreshToken,
      });
      await middleware(request);
      expect(mockSendRefreshRequest).toHaveBeenCalledWith(
        accessToken,
        refreshToken,
        {
          baseURL: 'http://api.example.com',
          originaryHost: 'localhost:3000',
        }
      );
    });

    it('sets Authorization header and new cookies on successful refresh', async () => {
      const accessToken = createToken({
        exp: Math.floor(Date.now() / 1000) - 60,
      });
      mockSendRefreshRequest.mockResolvedValue({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        tenant: 'tenant-id-123',
      });
      const request = createMockRequest('http://localhost:3000/dashboard', {
        SignInAccessToken: accessToken,
        SignInRefreshToken: 'old-refresh-token',
      });
      await middleware(request);

      const [callArgs] = mockNextResponseNext.mock.calls[0];
      const requestHeaders = (callArgs as any)?.request?.headers as Headers;
      expect(requestHeaders.get('Authorization')).toBe(
        'Bearer new-access-token'
      );

      expect(mockCookiesSet).toHaveBeenCalledWith(
        'SignInAccessToken',
        'new-access-token',
        { httpOnly: true, sameSite: 'strict' }
      );
      expect(mockCookiesSet).toHaveBeenCalledWith(
        'SignInRefreshToken',
        'new-refresh-token',
        { httpOnly: true, sameSite: 'strict' }
      );
    });

    it('sets x-lotta-tenant header when tenant is returned', async () => {
      const accessToken = createToken({
        exp: Math.floor(Date.now() / 1000) - 60,
      });
      mockSendRefreshRequest.mockResolvedValue({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        tenant: 'tenant-id-123',
      });
      const request = createMockRequest('http://localhost:3000/dashboard', {
        SignInAccessToken: accessToken,
        SignInRefreshToken: 'old-refresh-token',
      });
      await middleware(request);

      const [callArgs] = mockNextResponseNext.mock.calls[0];
      const requestHeaders = (callArgs as any)?.request?.headers as Headers;
      expect(requestHeaders.get('x-lotta-tenant')).toBe('tenant-id-123');
      expect(requestHeaders.get('x-lotta-originary-host')).toBeNull();
    });

    it('sets x-lotta-originary-host header when no tenant is returned', async () => {
      const accessToken = createToken({
        exp: Math.floor(Date.now() / 1000) - 60,
      });
      mockSendRefreshRequest.mockResolvedValue({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        tenant: null,
      });
      const request = createMockRequest(
        'http://myapp.example.com/dashboard',
        {
          SignInAccessToken: accessToken,
          SignInRefreshToken: 'old-refresh-token',
        },
        { host: 'myapp.example.com' }
      );
      await middleware(request);

      const [callArgs] = mockNextResponseNext.mock.calls[0];
      const requestHeaders = (callArgs as any)?.request?.headers as Headers;
      expect(requestHeaders.get('x-lotta-originary-host')).toBe(
        'myapp.example.com'
      );
      expect(requestHeaders.get('x-lotta-tenant')).toBeNull();
    });

    it('prefers x-forwarded-host over host header for originary host', async () => {
      const accessToken = createToken({
        exp: Math.floor(Date.now() / 1000) - 60,
      });
      mockSendRefreshRequest.mockResolvedValue({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        tenant: null,
      });
      const request = createMockRequest(
        'http://localhost:3000/dashboard',
        {
          SignInAccessToken: accessToken,
          SignInRefreshToken: 'old-refresh-token',
        },
        {
          'x-forwarded-host': 'forwarded.example.com',
          host: 'internal.example.com',
        }
      );
      await middleware(request);

      const [callArgs] = mockNextResponseNext.mock.calls[0];
      const requestHeaders = (callArgs as any)?.request?.headers as Headers;
      expect(requestHeaders.get('x-lotta-originary-host')).toBe(
        'forwarded.example.com'
      );
    });

    it('does not set cookies when refresh returns null tokens', async () => {
      const accessToken = createToken({
        exp: Math.floor(Date.now() / 1000) - 60,
      });
      mockSendRefreshRequest.mockResolvedValue({
        accessToken: null,
        refreshToken: null,
        tenant: null,
      });
      const request = createMockRequest('http://localhost:3000/dashboard', {
        SignInAccessToken: accessToken,
        SignInRefreshToken: 'old-refresh-token',
      });
      await middleware(request);

      expect(mockNextResponseNext).toHaveBeenCalled();
      expect(mockCookiesSet).not.toHaveBeenCalled();
    });
  });
});
