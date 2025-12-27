import { loadCategories } from './loadCategories';
import { getClient } from 'api/client';
import { ApolloClient, InMemoryCache } from '@apollo/client';
import { Defer20220824Handler } from '@apollo/client/incremental';
import { LocalState } from '@apollo/client/local-state';
import { MockLink } from '@apollo/client/testing';
import { vi } from 'vitest';

import GetCategoriesQuery from 'api/query/GetCategoriesQuery.graphql';

vi.mock('api/client');
vi.mock('@apollo/client-integration-nextjs', async (importOriginal) => ({
  ...(await importOriginal<any>()),
  registerApolloClient: vi.fn(),
}));
vi.mock('api/apollo/client-rsc', () => ({
  createRSCClient: vi.fn(),
}));

const mockGetClient = vi.mocked(getClient);

describe('loadCategories', () => {
  const createMockClient = (mocks: MockLink.MockedResponse[]) => {
    const mockLink = new MockLink(mocks);
    return new ApolloClient({
      link: mockLink,
      cache: new InMemoryCache(),

      localState: new LocalState({}),

      incrementalHandler: new Defer20220824Handler(),
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should load categories successfully', async () => {
    const mockCategories = [
      { id: '1', title: 'News', isHomepage: true, sortKey: 100 },
      { id: '2', title: 'Events', isHomepage: false, sortKey: 200 },
      { id: '3', title: 'Classes', isHomepage: false, sortKey: 300 },
    ];

    const mocks: MockLink.MockedResponse[] = [
      {
        request: { query: GetCategoriesQuery },
        result: { data: { categories: mockCategories } },
      },
    ];

    const client = createMockClient(mocks);
    mockGetClient.mockResolvedValue(client);

    const result = await loadCategories();

    expect(result).toEqual(mockCategories);
  });

  it('should return empty array when data is null', async () => {
    const mocks: MockLink.MockedResponse[] = [
      {
        request: { query: GetCategoriesQuery },
        result: { data: null },
      },
    ];

    const client = createMockClient(mocks);
    mockGetClient.mockResolvedValue(client);

    const result = await loadCategories();

    expect(result).toEqual([]);
  });

  it('should return empty array when categories is null', async () => {
    const mocks: MockLink.MockedResponse[] = [
      {
        request: { query: GetCategoriesQuery },
        result: { data: { categories: null } },
      },
    ];

    const client = createMockClient(mocks);
    mockGetClient.mockResolvedValue(client);

    const result = await loadCategories();

    expect(result).toEqual([]);
  });

  it('should handle query errors', async () => {
    const mocks: MockLink.MockedResponse[] = [
      {
        request: { query: GetCategoriesQuery },
        error: new Error('GraphQL error'),
      },
    ];

    const client = createMockClient(mocks);
    mockGetClient.mockResolvedValue(client);

    await expect(loadCategories()).rejects.toThrow('GraphQL error');
  });

  it('should handle client initialization errors', async () => {
    const error = new Error('Client error');
    mockGetClient.mockRejectedValue(error);

    await expect(loadCategories()).rejects.toThrow('Client error');
  });
});
