import axios from 'axios';
import { appConfig } from 'config';
import { Mocked } from 'vitest';
import { sendRefreshRequest } from './auth';

vi.mock('axios');
vi.mock('config');

const mockAxios = axios as Mocked<typeof axios>;
const mockAppConfig = appConfig as Mocked<typeof appConfig>;

describe('sendRefreshRequest', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should send refresh request and return data on success', async () => {
    const mockData = {
      accessToken: 'newAccessToken',
      refreshToken: 'newRefreshToken',
    };
    mockAxios.request.mockResolvedValue({ data: mockData });
    mockAppConfig.get.mockReturnValue('http://api.test');

    const result = await sendRefreshRequest('testToken', {
      'Custom-Header': 'value',
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

    const result = await sendRefreshRequest('testToken');

    expect(mockAxios.request).toHaveBeenCalled();
    expect(result).toBeNull();
    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });
});
