import { loadTenantUsage, GET_USAGE } from './loadTenantUsage';
import { getClient } from 'api/client';
import { MockedResponse } from '@apollo/client/testing';
import { ApolloClient, InMemoryCache } from '@apollo/client';
import { MockLink } from '@apollo/client/testing';
import { vi } from 'vitest';

vi.mock('api/client');
vi.mock('@apollo/experimental-nextjs-app-support', () => ({
  registerApolloClient: vi.fn(),
}));
vi.mock('api/apollo/client-rsc', () => ({
  createRSCClient: vi.fn(),
}));

const mockGetClient = vi.mocked(getClient);

describe('loadTenantUsage', () => {
  const createMockClient = (mocks: MockedResponse[]) => {
    const mockLink = new MockLink(mocks);
    return new ApolloClient({
      link: mockLink,
      cache: new InMemoryCache(),
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should load tenant usage successfully', async () => {
    const mockUsage = [
      {
        year: 2024,
        month: 1,
        activeUserCount: { value: 10, updatedAt: '2024-01-31T00:00:00Z' },
        totalStorageCount: { value: 1024, updatedAt: '2024-01-31T00:00:00Z' },
        mediaConversionSeconds: {
          value: 120,
          updatedAt: '2024-01-31T00:00:00Z',
        },
      },
      {
        year: 2024,
        month: 2,
        activeUserCount: { value: 15, updatedAt: '2024-02-29T00:00:00Z' },
        totalStorageCount: { value: 1536, updatedAt: '2024-02-29T00:00:00Z' },
        mediaConversionSeconds: {
          value: 180,
          updatedAt: '2024-02-29T00:00:00Z',
        },
      },
    ];

    const mocks: MockedResponse[] = [
      {
        request: { query: GET_USAGE },
        result: { data: { usage: mockUsage } },
      },
    ];

    const client = createMockClient(mocks);
    mockGetClient.mockResolvedValue(client);

    const result = await loadTenantUsage();

    expect(result).toEqual(mockUsage);
  });

  it('should return empty array when data is null', async () => {
    const mocks: MockedResponse[] = [
      {
        request: { query: GET_USAGE },
        result: { data: null },
      },
    ];

    const client = createMockClient(mocks);
    mockGetClient.mockResolvedValue(client);

    const result = await loadTenantUsage();

    expect(result).toEqual([]);
  });

  it('should return empty array when usage is null', async () => {
    const mocks: MockedResponse[] = [
      {
        request: { query: GET_USAGE },
        result: { data: { usage: null } },
      },
    ];

    const client = createMockClient(mocks);
    mockGetClient.mockResolvedValue(client);

    const result = await loadTenantUsage();

    expect(result).toEqual([]);
  });

  it('should handle query errors', async () => {
    const mocks: MockedResponse[] = [
      {
        request: { query: GET_USAGE },
        error: new Error('GraphQL error'),
      },
    ];

    const client = createMockClient(mocks);
    mockGetClient.mockResolvedValue(client);

    await expect(loadTenantUsage()).rejects.toThrow('GraphQL error');
  });

  it('should handle client initialization errors', async () => {
    const error = new Error('Client error');
    mockGetClient.mockRejectedValue(error);

    await expect(loadTenantUsage()).rejects.toThrow('Client error');
  });
});
