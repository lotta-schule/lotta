import axios from 'axios';
import { appConfig } from 'config';
import { Mocked, MockedFunction } from 'vitest';
import { sendRefreshRequest } from './auth';
import { isBrowser } from 'util/isBrowser';

vi.mock('axios');
vi.mock('config');
vi.mock('util/isBrowser');

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
    };
    isBrowserMock.mockReturnValue(false);
    mockAxios.request.mockResolvedValue({ data: mockData });
    mockAppConfig.get.mockReturnValue('http://api.test');

    const result = await sendRefreshRequest({
      'Custom-Header': 'value',
      Cookie: 'SignInRefreshToken=testToken',
    });

    expect(mockAxios.request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'post',
        baseURL: 'http://api.test',
        url: '/auth/token/refresh',
        headers: expect.objectContaining({
          Cookie: 'SignInRefreshToken=testToken',
          'Custom-Header': 'value',
        }),
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
    });

    expect(mockAxios.request).toHaveBeenCalled();
    expect(result).toBeNull();
    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });
});
