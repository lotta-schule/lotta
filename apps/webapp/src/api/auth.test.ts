import axios from 'axios';
import { Mocked, MockedFunction } from 'vitest';
import { sendRefreshRequest } from './auth.js';
import { isBrowser } from '#/util/isBrowser.js';
import { JWT } from '#/util/auth/jwt.js';

vi.mock('axios');
vi.mock('#/util/isBrowser.js');
vi.mock('#/util/auth/jwt.js');

const mockAxios = axios as Mocked<typeof axios>;
const isBrowserMock = isBrowser as MockedFunction<typeof isBrowser>;

describe('sendRefreshRequest', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should return null values when no access token is provided', async () => {
    const result = await sendRefreshRequest(undefined, 'refreshToken');

    expect(mockAxios.request).not.toHaveBeenCalled();
    expect(result).toEqual({
      accessToken: null,
      refreshToken: null,
      tenant: null,
    });
  });

  it('should return null values when access token has no tenant id', async () => {
    vi.mocked(JWT.parse).mockReturnValue({ body: {} } as any);

    const result = await sendRefreshRequest('accessToken', 'refreshToken');

    expect(mockAxios.request).not.toHaveBeenCalled();
    expect(result).toEqual({
      accessToken: null,
      refreshToken: null,
      tenant: null,
    });
  });

  it('should send refresh request and return data on success', async () => {
    isBrowserMock.mockReturnValue(false);
    vi.mocked(JWT.parse).mockReturnValue({ body: { tid: 'tenantId' } } as any);
    mockAxios.request.mockResolvedValue({
      data: { accessToken: 'newAccessToken' },
      headers: {
        'set-cookie': 'SignInRefreshToken=newRefreshToken; Path=/; HttpOnly',
        'x-lotta-tenant': 'id:tenantId',
      },
    });

    const result = await sendRefreshRequest(
      'oldAccessToken',
      'oldRefreshToken',
      {
        baseURL: 'http://api.test',
        originaryHost: 'testHost',
      }
    );

    expect(mockAxios.request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'post',
        baseURL: 'http://api.test',
        url: '/auth/token/refresh',
        withCredentials: false,
        headers: expect.objectContaining({
          'x-originary-host': 'testHost',
          'x-lotta-tenant': 'id:tenantId',
        }),
        data: {
          accessToken: 'oldAccessToken',
          refreshToken: 'oldRefreshToken',
        },
      })
    );
    expect(result).toEqual({
      accessToken: 'newAccessToken',
      refreshToken: 'newRefreshToken',
      tenant: 'id:tenantId',
    });
  });

  it('should return null values when response is missing access token', async () => {
    isBrowserMock.mockReturnValue(false);
    vi.mocked(JWT.parse).mockReturnValue({ body: { tid: 'tenantId' } } as any);
    mockAxios.request.mockResolvedValue({
      data: { accessToken: null },
      headers: {
        'set-cookie': 'SignInRefreshToken=newRefreshToken; Path=/; HttpOnly',
      },
    });

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
    vi.mocked(JWT.parse).mockReturnValue({ body: { tid: 'tenantId' } } as any);
    mockAxios.request.mockResolvedValue({
      data: { accessToken: 'newAccessToken' },
      headers: {},
    });

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

  it('should return null values and log error on request failure', async () => {
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    vi.mocked(JWT.parse).mockReturnValue({ body: { tid: 'tenantId' } } as any);
    mockAxios.request.mockRejectedValue(new Error('Network Error'));

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
