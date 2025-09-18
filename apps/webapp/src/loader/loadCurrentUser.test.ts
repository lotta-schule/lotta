import { loadCurrentUser, UnauthenticatedError } from './loadCurrentUser';
import { getClient } from 'api/client';
import { MockedResponse } from '@apollo/client/testing';
import { ApolloClient, InMemoryCache } from '@apollo/client';
import { MockLink } from '@apollo/client/testing';
import { vi } from 'vitest';
import { GET_CURRENT_USER } from 'util/user/useCurrentUser';

vi.mock('api/client');
vi.mock('@apollo/experimental-nextjs-app-support', () => ({
  registerApolloClient: vi.fn(),
}));
vi.mock('api/apollo/client-rsc', () => ({
  createRSCClient: vi.fn(),
}));

const mockGetClient = vi.mocked(getClient);

describe('loadCurrentUser', () => {
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

  it('should load current user successfully', async () => {
    const mockUser = {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      role: 'user',
    };

    const mocks: MockedResponse[] = [
      {
        request: { query: GET_CURRENT_USER },
        result: { data: { currentUser: mockUser } },
      },
    ];

    const client = createMockClient(mocks);
    mockGetClient.mockResolvedValue(client);

    const result = await loadCurrentUser();

    expect(result).toEqual(mockUser);
  });

  it('should return null when user is not authenticated', async () => {
    const mocks: MockedResponse[] = [
      {
        request: { query: GET_CURRENT_USER },
        result: { data: { currentUser: null } },
      },
    ];

    const client = createMockClient(mocks);
    mockGetClient.mockResolvedValue(client);

    const result = await loadCurrentUser();

    expect(result).toBeNull();
  });

  it('should return null when data is null', async () => {
    const mocks: MockedResponse[] = [
      {
        request: { query: GET_CURRENT_USER },
        result: { data: null },
      },
    ];

    const client = createMockClient(mocks);
    mockGetClient.mockResolvedValue(client);

    const result = await loadCurrentUser();

    expect(result).toBeNull();
  });

  it('should throw UnauthenticatedError when forceAuthenticated is true and user is null', async () => {
    const mocks: MockedResponse[] = [
      {
        request: { query: GET_CURRENT_USER },
        result: { data: { currentUser: null } },
      },
    ];

    const client = createMockClient(mocks);
    mockGetClient.mockResolvedValue(client);

    await expect(loadCurrentUser({ forceAuthenticated: true })).rejects.toThrow(
      UnauthenticatedError
    );
  });

  it('should return user when forceAuthenticated is true and user exists', async () => {
    const mockUser = {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      role: 'user',
    };

    const mocks: MockedResponse[] = [
      {
        request: { query: GET_CURRENT_USER },
        result: { data: { currentUser: mockUser } },
      },
    ];

    const client = createMockClient(mocks);
    mockGetClient.mockResolvedValue(client);

    const result = await loadCurrentUser({ forceAuthenticated: true });

    expect(result).toEqual(mockUser);
  });

  it('should handle query errors', async () => {
    const mocks: MockedResponse[] = [
      {
        request: { query: GET_CURRENT_USER },
        error: new Error('GraphQL error'),
      },
    ];

    const client = createMockClient(mocks);
    mockGetClient.mockResolvedValue(client);

    await expect(loadCurrentUser()).rejects.toThrow('GraphQL error');
  });

  it('should handle client initialization errors', async () => {
    const error = new Error('Client error');
    mockGetClient.mockRejectedValue(error);

    await expect(loadCurrentUser()).rejects.toThrow('Client error');
  });

  describe('UnauthenticatedError', () => {
    it('should have correct name and message', () => {
      const error = new UnauthenticatedError();
      expect(error.name).toBe('UnauthenticatedError');
      expect(error.message).toBe('User is not authenticated');
    });
  });
});
