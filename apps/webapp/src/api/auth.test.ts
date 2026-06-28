import { MockedFunction } from 'vitest';
import { sendRefreshRequest } from './auth';
import { isBrowser } from '#/util/isBrowser';
import { JWT } from '#/util/auth/jwt';

vi.mock('#/util/isBrowser');
vi.mock('#/util/auth/jwt');

const isBrowserMock = isBrowser as MockedFunction<typeof isBrowser>;

const makeFetchResponse = (
  body: object | null,
  headers: Record<string, string> = {},
  ok = true
): Response =>
  ({
    ok,
    status: ok ? 200 : 401,
    json: () => Promise.resolve(body),
    headers: {
      get: (key: string) => headers[key] ?? null,
    },
  }) as unknown as Response;

describe('sendRefreshRequest', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.resetAllMocks();
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should attempt refresh even without an access token (RFC 6749)', async () => {
    isBrowserMock.mockReturnValue(false);
    fetchMock.mockResolvedValue(
      makeFetchResponse(
        { accessToken: 'newAccessToken' },
        { 'set-cookie': 'SignInRefreshToken=newRefreshToken; Path=/; HttpOnly' }
      )
    );

    const result = await sendRefreshRequest(null, 'refreshToken', {
      originaryHost: 'testHost',
    });

    expect(fetchMock).toHaveBeenCalledWith(
      '/auth/token/refresh',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'x-lotta-originary-host': 'testHost',
        }),
      })
    );
    expect(result).toEqual({
      accessToken: 'newAccessToken',
      refreshToken: 'newRefreshToken',
      tenant: null,
    });
  });

  it('uses x-lotta-tenant header when tenantId is extractable from access token', async () => {
    isBrowserMock.mockReturnValue(false);
    // oxlint-disable-next-line typescript/unbound-method
    vi.mocked(JWT.parse).mockReturnValue({
      body: { tenantId: 42 },
    } as any);
    fetchMock.mockResolvedValue(
      makeFetchResponse(
        { accessToken: 'newAccessToken' },
        {
          'set-cookie': 'SignInRefreshToken=newRefreshToken; Path=/; HttpOnly',
          'x-lotta-tenant': 'id:42',
        }
      )
    );

    const result = await sendRefreshRequest(
      'oldAccessToken',
      'oldRefreshToken',
      {
        baseURL: 'http://api.test',
        originaryHost: 'testHost',
      }
    );

    expect(fetchMock).toHaveBeenCalledWith(
      'http://api.test/auth/token/refresh',
      expect.objectContaining({
        method: 'POST',
        credentials: 'omit',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'x-lotta-tenant': 'id:42',
        }),
        body: JSON.stringify({ token: 'oldRefreshToken' }),
      })
    );
    expect(result).toEqual({
      accessToken: 'newAccessToken',
      refreshToken: 'newRefreshToken',
      tenant: 'id:42',
    });
  });

  it('uses credentials: include in the browser', async () => {
    isBrowserMock.mockReturnValue(true);
    fetchMock.mockResolvedValue(
      makeFetchResponse(
        { accessToken: 'newAccessToken' },
        { 'set-cookie': 'SignInRefreshToken=newRefreshToken; Path=/; HttpOnly' }
      )
    );

    await sendRefreshRequest(null, null);

    expect(fetchMock).toHaveBeenCalledWith(
      '/auth/token/refresh',
      expect.objectContaining({ credentials: 'include' })
    );
  });

  it('should return null values when response is missing access token', async () => {
    isBrowserMock.mockReturnValue(false);
    fetchMock.mockResolvedValue(
      makeFetchResponse(
        { accessToken: null },
        { 'set-cookie': 'SignInRefreshToken=newRefreshToken; Path=/; HttpOnly' }
      )
    );

    const result = await sendRefreshRequest(
      'oldAccessToken',
      'oldRefreshToken'
    );

    expect(result).toEqual({
      accessToken: null,
      refreshToken: null,
      tenant: null,
    });
  });

  it('should return null values when response is missing refresh token cookie', async () => {
    isBrowserMock.mockReturnValue(false);
    fetchMock.mockResolvedValue(
      makeFetchResponse({ accessToken: 'newAccessToken' }, {})
    );

    const result = await sendRefreshRequest(
      'oldAccessToken',
      'oldRefreshToken'
    );

    expect(result).toEqual({
      accessToken: null,
      refreshToken: null,
      tenant: null,
    });
  });

  it('should return null values when server responds with an error status', async () => {
    isBrowserMock.mockReturnValue(false);
    fetchMock.mockResolvedValue(makeFetchResponse(null, {}, false));

    const result = await sendRefreshRequest(
      'oldAccessToken',
      'oldRefreshToken'
    );

    expect(result).toEqual({
      accessToken: null,
      refreshToken: null,
      tenant: null,
    });
  });

  it('should return null values and log error on network failure', async () => {
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    fetchMock.mockRejectedValue(new Error('Network Error'));

    const result = await sendRefreshRequest(
      'oldAccessToken',
      'oldRefreshToken'
    );

    expect(result).toEqual({
      accessToken: null,
      refreshToken: null,
      tenant: null,
    });
    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });
});
