import { loadFeedback } from './loadFeedback';
import { getClient } from 'api/client';
import { ApolloClient, InMemoryCache } from '@apollo/client';
import { Defer20220824Handler } from '@apollo/client/incremental';
import { MockLink } from '@apollo/client/testing';
import { vi } from 'vitest';

import GetFeedbackQuery from 'api/query/GetFeedbackQuery.graphql';

vi.mock('api/client');
vi.mock('@apollo/client-integration-nextjs', () => ({
  registerApolloClient: vi.fn(),
}));
vi.mock('api/apollo/client-rsc', () => ({
  createRSCClient: vi.fn(),
}));

const mockGetClient = vi.mocked(getClient);

describe('loadFeedback', () => {
  const createMockClient = (mocks: MockLink.MockedResponse[]) => {
    const mockLink = new MockLink(mocks);
    return new ApolloClient({
      link: mockLink,
      cache: new InMemoryCache(),
      incrementalHandler: new Defer20220824Handler(),
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should load feedback successfully', async () => {
    const mockFeedbacks = [
      { id: '1', topic: 'Bug Report', content: 'Found a bug', userId: '123' },
      {
        id: '2',
        topic: 'Feature Request',
        content: 'New feature idea',
        userId: '456',
      },
    ];

    const mocks: MockLink.MockedResponse[] = [
      {
        request: { query: GetFeedbackQuery },
        result: { data: { feedbacks: mockFeedbacks } },
      },
    ];

    const client = createMockClient(mocks);
    mockGetClient.mockResolvedValue(client);

    const result = await loadFeedback();

    expect(result).toEqual(mockFeedbacks);
  });

  it('should return empty array when data is null', async () => {
    const mocks: MockLink.MockedResponse[] = [
      {
        request: { query: GetFeedbackQuery },
        result: { data: null },
      },
    ];

    const client = createMockClient(mocks);
    mockGetClient.mockResolvedValue(client);

    const result = await loadFeedback();

    expect(result).toEqual([]);
  });

  it('should return empty array when feedbacks is null', async () => {
    const mocks: MockLink.MockedResponse[] = [
      {
        request: { query: GetFeedbackQuery },
        result: { data: { feedbacks: null } },
      },
    ];

    const client = createMockClient(mocks);
    mockGetClient.mockResolvedValue(client);

    const result = await loadFeedback();

    expect(result).toEqual([]);
  });

  it('should handle query errors', async () => {
    const mocks: MockLink.MockedResponse[] = [
      {
        request: { query: GetFeedbackQuery },
        error: new Error('GraphQL error'),
      },
    ];

    const client = createMockClient(mocks);
    mockGetClient.mockResolvedValue(client);

    await expect(loadFeedback()).rejects.toThrow('GraphQL error');
  });

  it('should handle client initialization errors', async () => {
    const error = new Error('Client error');
    mockGetClient.mockRejectedValue(error);

    await expect(loadFeedback()).rejects.toThrow('Client error');
  });
});
