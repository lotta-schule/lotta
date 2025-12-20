import axios from 'axios';
import { Mocked, MockedFunction } from 'vitest';
import { createHeaders, createCustomFetch } from './customFetch';
import { appConfig } from 'config';

vi.mock('axios');
const appConfigGet = vi.spyOn(appConfig, 'get');

const mockAxios = axios as Mocked<typeof axios> & MockedFunction<typeof axios>;

describe.todo('createHeaders', () => {
  it('should create headers with default values', () => {
    const headers = createHeaders();

    expect(headers).toEqual({
      accept: 'application/json',
      'Content-Type': 'application/json',
      'x-lotta-originary-host': undefined,
    });
  });

  it('should overwrite headers with provided values', () => {
    const headers = createHeaders({
      host: 'example.com',
      'x-lotta-originary-host': 'original-host',
      'Custom-Header': 'custom-value',
    });

    expect(headers).toEqual({
      accept: 'application/json',
      'Content-Type': 'application/json',
      'x-lotta-originary-host': 'original-host',
      host: 'example.com',
      'Custom-Header': 'custom-value',
    });
  });
});

describe.todo('createCustomFetch', () => {
  afterAll(() => {
    vi.resetAllMocks();
  });

  const mockRequestExtraHeaders = vi.fn().mockReturnValue({
    'Extra-Header': 'extra-value',
  });

  const customFetch = createCustomFetch({
    requestExtraHeaders: mockRequestExtraHeaders,
  });

  it('should make a request with merged headers', async () => {
    const mockResponseData = { success: true };
    const mockResponseHeaders = { 'content-type': 'application/json' };

    mockAxios.mockResolvedValue({
      data: mockResponseData,
      status: 200,
      statusText: 'OK',
      headers: mockResponseHeaders,
    });

    const response = await customFetch('http://example.com', {
      method: 'GET',
      headers: { 'Custom-Header': 'custom-value' },
    });

    expect(mockAxios).toHaveBeenCalledWith({
      method: 'GET',
      headers: expect.objectContaining({
        accept: 'application/json',
        'Content-Type': 'application/json',
        'x-lotta-originary-host': undefined,
        'Extra-Header': 'extra-value',
        'Custom-Header': 'custom-value',
      }),
      url: 'http://example.com',
      data: undefined,
      withCredentials: true,
    });

    expect(response.status).toBe(200);
    expect(response.statusText).toBe('OK');
    const responseBody = await response.json();
    expect(responseBody).toEqual(mockResponseData);
  });

  it('should handle request with body', async () => {
    const mockResponseData = { success: true };
    const mockResponseHeaders = { 'content-type': 'application/json' };

    mockAxios.mockResolvedValue({
      data: mockResponseData,
      status: 200,
      statusText: 'OK',
      headers: mockResponseHeaders,
    });

    const requestBody = { key: 'value' };

    const response = await customFetch('http://example.com', {
      method: 'POST',
      headers: { 'Custom-Header': 'custom-value' },
      body: requestBody as any,
    });

    expect(mockAxios).toHaveBeenCalledWith({
      method: 'POST',
      headers: expect.objectContaining({
        accept: 'application/json',
        'Content-Type': 'application/json',
        'x-lotta-originary-host': undefined,
        'Extra-Header': 'extra-value',
        'Custom-Header': 'custom-value',
      }),
      url: 'http://example.com',
      data: requestBody,
      withCredentials: true,
    });

    expect(response.status).toBe(200);
    expect(response.statusText).toBe('OK');
    const responseBody = await response.json();
    expect(responseBody).toEqual(mockResponseData);
  });

  it('should handle request with tenantSlugOverwrite', async () => {
    const mockResponseData = { success: true };
    const mockResponseHeaders = { 'content-type': 'application/json' };

    const tenantSlugOverwrite = 'test-slug-overwrite';

    appConfigGet.mockImplementation((key) => {
      if (key === 'FORCE_TENANT_SLUG') {
        return tenantSlugOverwrite;
      }
      return appConfig.get(key);
    });

    mockAxios.mockResolvedValue({
      data: mockResponseData,
      status: 200,
      statusText: 'OK',
      headers: mockResponseHeaders,
    });

    const response = await customFetch('http://example.com', {
      method: 'GET',
      headers: { 'Custom-Header': 'custom-value' },
    });

    expect(mockAxios).toHaveBeenCalledWith({
      method: 'GET',
      headers: expect.objectContaining({
        accept: 'application/json',
        'Content-Type': 'application/json',
        'x-lotta-originary-host': undefined,
        'Extra-Header': 'extra-value',
        'Custom-Header': 'custom-value',
        tenant: `slug:${tenantSlugOverwrite}`,
      }),
      url: 'http://example.com',
      data: undefined,
      withCredentials: true,
    });

    expect(response.status).toBe(200);
    expect(response.statusText).toBe('OK');
    const responseBody = await response.json();
    expect(responseBody).toEqual(mockResponseData);
  });
});
