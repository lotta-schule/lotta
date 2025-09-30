import { loadWidgets } from './loadWidgets';
import { getClient } from 'api/client';
import { MockedResponse } from '@apollo/client/testing';
import { ApolloClient, InMemoryCache } from '@apollo/client';
import { MockLink } from '@apollo/client/testing';
import { vi } from 'vitest';

import GetWidgetsQuery from 'api/query/GetWidgetsQuery.graphql';

vi.mock('api/client');
vi.mock('@apollo/experimental-nextjs-app-support', () => ({
  registerApolloClient: vi.fn(),
}));
vi.mock('api/apollo/client-rsc', () => ({
  createRSCClient: vi.fn(),
}));

const mockGetClient = vi.mocked(getClient);

describe('loadWidgets', () => {
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

  it('should load widgets successfully', async () => {
    const mockWidgets = [
      { id: '1', title: 'Widget 1', type: 'calendar' },
      { id: '2', title: 'Widget 2', type: 'schedule' },
    ];

    const mocks: MockedResponse[] = [
      {
        request: { query: GetWidgetsQuery },
        result: { data: { widgets: mockWidgets } },
      },
    ];

    const client = createMockClient(mocks);
    mockGetClient.mockResolvedValue(client);

    const result = await loadWidgets();

    expect(result).toEqual(mockWidgets);
  });

  it('should return empty array when data is null', async () => {
    const mocks: MockedResponse[] = [
      {
        request: { query: GetWidgetsQuery },
        result: { data: null },
      },
    ];

    const client = createMockClient(mocks);
    mockGetClient.mockResolvedValue(client);

    const result = await loadWidgets();

    expect(result).toEqual([]);
  });

  it('should return empty array when widgets is null', async () => {
    const mocks: MockedResponse[] = [
      {
        request: { query: GetWidgetsQuery },
        result: { data: { widgets: null } },
      },
    ];

    const client = createMockClient(mocks);
    mockGetClient.mockResolvedValue(client);

    const result = await loadWidgets();

    expect(result).toEqual([]);
  });

  it('should handle query errors', async () => {
    const mocks: MockedResponse[] = [
      {
        request: { query: GetWidgetsQuery },
        error: new Error('GraphQL error'),
      },
    ];

    const client = createMockClient(mocks);
    mockGetClient.mockResolvedValue(client);

    await expect(loadWidgets()).rejects.toThrow('GraphQL error');
  });

  it('should handle client initialization errors', async () => {
    const error = new Error('Client error');
    mockGetClient.mockRejectedValue(error);

    await expect(loadWidgets()).rejects.toThrow('Client error');
  });
});
