import { loadTenantUsage } from './loadTenantUsage';
import { getClient } from 'api/client';
import { MockedResponse } from '@apollo/client/testing';
import { ApolloClient, InMemoryCache } from '@apollo/client';
import { MockLink } from '@apollo/client/testing';
import { vi } from 'vitest';

import GetUsageQuery from 'api/query/GetUsageQuery.graphql';

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
      { period: '2024-01', storageUsed: 1024, transferUsed: 2048 },
      { period: '2024-02', storageUsed: 1536, transferUsed: 3072 },
    ];

    const mocks: MockedResponse[] = [
      {
        request: { query: GetUsageQuery },
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
        request: { query: GetUsageQuery },
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
        request: { query: GetUsageQuery },
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
        request: { query: GetUsageQuery },
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
