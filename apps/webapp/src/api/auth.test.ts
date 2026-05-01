import axios from 'axios';
import { appConfig } from '#/config.js';
import { Mocked, MockedFunction } from 'vitest';
import { sendRefreshRequest } from './auth.js';
import { isBrowser } from '#/util/isBrowser.js';

vi.mock('axios');
vi.mock('#/config.js');
vi.mock('#/util/isBrowser.js');

const mockAxios = axios as Mocked<typeof axios>;
const mockAppConfig = appConfig as Mocked<typeof appConfig>;
const isBrowserMock = isBrowser as MockedFunction<typeof isBrowser>;

describe('sendRefreshRequest', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should send refresh request and return data on success', async () => {
    const mockData = {
      accessToken: 'newAccessToken',
      refreshToken: 'newRefreshToken',
      tenant: 'id:tenantId',
    };
    isBrowserMock.mockReturnValue(false);
    mockAxios.request.mockResolvedValue({
      data: mockData,
      headers: {
        'set-cookie': 'SignInRefreshToken=newRefreshToken; Path=/; HttpOnly',
        'x-lotta-tenant': 'id:tenantId',
      },
    });
    mockAppConfig.get.mockReturnValue('http://api.test');

    const result = await sendRefreshRequest(
      {
        host: 'testHost',
      },
      'testToken',
      appConfig.get('API_URL')
    );

    expect(mockAxios.request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'post',
        baseURL: 'http://api.test',
        url: '/auth/token/refresh',
        withCredentials: false,
        data: { token: 'testToken' },
      })
    );
    expect(result).toEqual(mockData);
  });

  it('should return null and log error on failure', async () => {
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    mockAxios.request.mockRejectedValue(new Error('Network Error'));

    const result = await sendRefreshRequest({
      Cookie: 'SignInRefreshToken=testToken',
    } as any);

    expect(mockAxios.request).toHaveBeenCalled();
    expect(result).toEqual({
      accessToken: null,
      refreshToken: null,
      tenant: null,
    });
    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });
});
