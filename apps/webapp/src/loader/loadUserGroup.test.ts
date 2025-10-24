import { loadUserGroup, GET_GROUP_QUERY } from './loadUserGroup';
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

describe('loadUserGroup', () => {
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

  it('should load user group successfully', async () => {
    const mockGroup = {
      id: '1',
      name: 'Test Group',
      isAdminGroup: false,
      sortKey: 100,
      enrollmentTokens: ['token1', 'token2'],
      canReadFullName: true,
    };

    const mocks: MockedResponse[] = [
      {
        request: {
          query: GET_GROUP_QUERY,
          variables: { id: '1' },
        },
        result: { data: { group: mockGroup } },
      },
    ];

    const client = createMockClient(mocks);
    mockGetClient.mockResolvedValue(client);

    const result = await loadUserGroup('1');

    expect(result).toEqual(mockGroup);
  });

  it('should return null when group is not found', async () => {
    const mocks: MockedResponse[] = [
      {
        request: {
          query: GET_GROUP_QUERY,
          variables: { id: 'nonexistent' },
        },
        result: { data: { group: null } },
      },
    ];

    const client = createMockClient(mocks);
    mockGetClient.mockResolvedValue(client);

    const result = await loadUserGroup('nonexistent');

    expect(result).toBeNull();
  });

  it('should return null when data is null', async () => {
    const mocks: MockedResponse[] = [
      {
        request: {
          query: GET_GROUP_QUERY,
          variables: { id: '1' },
        },
        result: { data: null },
      },
    ];

    const client = createMockClient(mocks);
    mockGetClient.mockResolvedValue(client);

    const result = await loadUserGroup('1');

    expect(result).toBeNull();
  });

  it('should handle query errors', async () => {
    const mocks: MockedResponse[] = [
      {
        request: {
          query: GET_GROUP_QUERY,
          variables: { id: '1' },
        },
        error: new Error('GraphQL error'),
      },
    ];

    const client = createMockClient(mocks);
    mockGetClient.mockResolvedValue(client);

    await expect(loadUserGroup('1')).rejects.toThrow('GraphQL error');
  });

  it('should handle client initialization errors', async () => {
    const error = new Error('Client error');
    mockGetClient.mockRejectedValue(error);

    await expect(loadUserGroup('1')).rejects.toThrow('Client error');
  });
});
