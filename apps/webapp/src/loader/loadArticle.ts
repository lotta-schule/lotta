import { cache } from 'react';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { getClient } from '#/api/client';
import { ArticleModel, ID } from '#/model';

import GetArticleQuery from '#/api/query/GetArticleQuery.graphql';

/**
 * Loads an article. Returns null when the article doesn't exist or the
 * current user isn't allowed to read it (core answers both with a GraphQL
 * error), so the page can render a 404 without revealing restricted articles.
 * Other errors (e.g. network errors) are thrown.
 */
export const loadArticle = cache(async (id: ID) => {
  const client = await getClient();
  const { data, error } = await client.query<
    { article: ArticleModel | null },
    { id: ID }
  >({
    query: GetArticleQuery,
    variables: { id },
    errorPolicy: 'all',
  });

  if (data?.article) {
    return data.article;
  }
  if (error && !CombinedGraphQLErrors.is(error)) {
    throw error;
  }
  return null;
});
