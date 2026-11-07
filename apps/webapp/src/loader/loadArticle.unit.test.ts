import { loadArticle } from './loadArticle';
import { getClient } from '#/api/client';
import { ApolloClient, InMemoryCache } from '@apollo/client';
import { LocalState } from '@apollo/client/local-state';
import { Defer20220824Handler } from '@apollo/client/incremental';
import { GraphQLError } from 'graphql';
import { MockLink } from '@apollo/client/testing';
import { vi } from 'vitest';

import GetArticleQuery from '#/api/query/GetArticleQuery.graphql';

vi.mock('#/api/client');
vi.mock('@apollo/client-integration-nextjs', async (importOriginal) => ({
  ...(await importOriginal<any>()),
  registerApolloClient: vi.fn(),
}));
vi.mock('#/api/apollo/client-rsc', () => ({
  createRSCClient: vi.fn(),
}));

const mockGetClient = vi.mocked(getClient);

const useMocks = (mocks: MockLink.MockedResponse[]) => {
  mockGetClient.mockResolvedValue(
    new ApolloClient({
      link: new MockLink(mocks),
      cache: new InMemoryCache(),
      incrementalHandler: new Defer20220824Handler(),
      localState: new LocalState({}),
    })
  );
};

describe('loadArticle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null when core answers with a GraphQL error (forbidden or not found)', async () => {
    useMocks([
      {
        request: { query: GetArticleQuery, variables: { id: '1' } },
        result: {
          data: { article: null },
          errors: [
            new GraphQLError(
              'Du hast nicht die Rechte dir diesen Beitrag anzusehen.'
            ),
          ],
        },
      },
    ]);

    await expect(loadArticle('1')).resolves.toBeNull();
  });

  it('returns null when the article is null', async () => {
    useMocks([
      {
        request: { query: GetArticleQuery, variables: { id: '2' } },
        result: { data: { article: null } },
      },
    ]);

    await expect(loadArticle('2')).resolves.toBeNull();
  });

  it('throws network errors', async () => {
    useMocks([
      {
        request: { query: GetArticleQuery, variables: { id: '3' } },
        error: new Error('core is down'),
      },
    ]);

    await expect(loadArticle('3')).rejects.toThrow('core is down');
  });
});
