import { loadUserGroups } from './loadUserGroups';
import { getClient } from 'api/client';
import { MockedResponse } from '@apollo/client/testing';
import { ApolloClient, InMemoryCache } from '@apollo/client';
import { MockLink } from '@apollo/client/testing';
import { vi } from 'vitest';
import { GET_USER_GROUPS } from 'util/tenant/useUserGroups';

vi.mock('api/client');
vi.mock('@apollo/experimental-nextjs-app-support', () => ({
  registerApolloClient: vi.fn(),
}));
vi.mock('api/apollo/client-rsc', () => ({
  createRSCClient: vi.fn(),
}));

const mockGetClient = vi.mocked(getClient);

describe('loadUserGroups', () => {
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

  it('should load user groups successfully', async () => {
    const mockUserGroups = [
      { id: '1', name: 'Administrators', isAdminGroup: true, sortKey: 100 },
      { id: '2', name: 'Teachers', isAdminGroup: false, sortKey: 200 },
      { id: '3', name: 'Students', isAdminGroup: false, sortKey: 300 },
    ];

    const mocks: MockedResponse[] = [
      {
        request: { query: GET_USER_GROUPS },
        result: { data: { userGroups: mockUserGroups } },
      },
    ];

    const client = createMockClient(mocks);
    mockGetClient.mockResolvedValue(client);

    const result = await loadUserGroups();

    expect(result).toEqual(mockUserGroups);
  });

  it('should handle empty user groups array', async () => {
    const mocks: MockedResponse[] = [
      {
        request: { query: GET_USER_GROUPS },
        result: { data: { userGroups: [] } },
      },
    ];

    const client = createMockClient(mocks);
    mockGetClient.mockResolvedValue(client);

    const result = await loadUserGroups();

    expect(result).toEqual([]);
  });

  it('should handle query errors', async () => {
    const mocks: MockedResponse[] = [
      {
        request: { query: GET_USER_GROUPS },
        error: new Error('GraphQL error'),
      },
    ];

    const client = createMockClient(mocks);
    mockGetClient.mockResolvedValue(client);

    await expect(loadUserGroups()).rejects.toThrow('GraphQL error');
  });

  it('should handle client initialization errors', async () => {
    const error = new Error('Client error');
    mockGetClient.mockRejectedValue(error);

    await expect(loadUserGroups()).rejects.toThrow('Client error');
  });
});
