import { Mocked, MockedFunction } from 'vitest';
import { headers } from 'next/headers';
import { appConfig } from 'config';
import { getBaseUrlString, getBaseUrl } from './baseUrl';

vi.mock('next/headers', () => {
  const headers = new Map();
  const getHeaders = vi.fn(() => headers);

  return {
    headers: getHeaders,
    default: getHeaders,
  };
});
vi.mock('../loader', () => ({
  loadTenant: vi.fn(async () => ({
    id: '1',
    host: 'tenant-host.com',
  })),
  loadCurrentUser: vi.fn(async () => null),
}));
vi.mock('config');
vi.mock('api/client', () => ({
  getClient: vi.fn(),
}));

const mockHeaders = headers as MockedFunction<typeof headers>;
const mockAppConfig = appConfig as Mocked<typeof appConfig>;

describe('baseUrl', () => {
  afterAll(() => {
    vi.clearAllMocks();
  });
  describe('getBaseUrlString', () => {
    it('should return FORCE_BASE_URL if set in appConfig', async () => {
      mockAppConfig.get.mockReturnValue('https://forced-url.com');

      const result = await getBaseUrlString();

      expect(result).toBe('https://forced-url.com');
    });

    it('should return URL based on tenant and headers', async () => {
      mockAppConfig.get.mockReturnValue('');
      mockHeaders.mockReturnValue({
        get: (key: string) => (key === 'host' ? 'header-host.com' : null),
      } as any);

      const result = await getBaseUrlString();

      expect(result).toBe('https://header-host.com');
    });

    it('should fallback to tenant host if headers do not provide host', async () => {
      mockAppConfig.get.mockReturnValue('');
      mockHeaders.mockReturnValue({
        get: (key: string) => (key === 'x-forwarded-proto' ? 'http' : null),
      } as any);

      const result = await getBaseUrlString();

      expect(result).toBe('http://tenant-host.com');
    });

    it('should use https as default protocol', async () => {
      mockAppConfig.get.mockReturnValue('');
      mockHeaders.mockReturnValue({
        get: (_key: string) => null,
      } as any);

      const result = await getBaseUrlString();

      expect(result).toBe('https://tenant-host.com');
    });
  });

  describe('getBaseUrl', () => {
    it('should return URL string with default base URL', async () => {
      mockAppConfig.get.mockReturnValue('');

      const result = await getBaseUrl();

      expect(result).toBe('https://tenant-host.com/');
    });

    it('should append search parameters to the URL', async () => {
      mockAppConfig.get.mockReturnValue('');

      const result = await getBaseUrl({
        searchParams: { foo: 'bar', baz: 'qux' },
      });

      expect(result).toBe('https://tenant-host.com/?foo=bar&baz=qux');
    });

    it('should override parts of the URL', async () => {
      mockAppConfig.get.mockReturnValue('');

      const result = await getBaseUrl({
        pathname: '/path',
        searchParams: { foo: 'bar' },
      });

      expect(result).toBe('https://tenant-host.com/path?foo=bar');
    });
  });
});
