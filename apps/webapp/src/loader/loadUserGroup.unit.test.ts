import { loadUserGroup, GET_GROUP_QUERY } from './loadUserGroup.js';
import { getClient } from '#/api/client.js';
import { ApolloClient, InMemoryCache } from '@apollo/client';
import { LocalState } from '@apollo/client/local-state';
import { Defer20220824Handler } from '@apollo/client/incremental';
import { MockLink } from '@apollo/client/testing';
import { vi } from 'vitest';

vi.mock('#/api/client.js');
vi.mock('@apollo/client-integration-nextjs', async (importOriginal) => ({
  ...(await importOriginal<any>()),
  registerApolloClient: vi.fn(),
}));
vi.mock('#/api/apollo/client-rsc.js', () => ({
  createRSCClient: vi.fn(),
}));

const mockGetClient = vi.mocked(getClient);

describe('loadUserGroup', () => {
  const createMockClient = (mocks: MockLink.MockedResponse[]) => {
    const mockLink = new MockLink(mocks);
    return new ApolloClient({
      link: mockLink,
      cache: new InMemoryCache(),
      incrementalHandler: new Defer20220824Handler(),

      /*
      Inserted by Apollo Client 3->4 migration codemod.
      If you are not using the `@client` directive in your application,
      you can safely remove this option.
      */
      localState: new LocalState({}),
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

    const mocks: MockLink.MockedResponse[] = [
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
    const mocks: MockLink.MockedResponse[] = [
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
    const mocks: MockLink.MockedResponse[] = [
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
    const mocks: MockLink.MockedResponse[] = [
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
