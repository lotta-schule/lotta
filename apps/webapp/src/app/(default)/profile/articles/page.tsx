import { getClient } from '#/api/client';
import { ArticlesPage } from '#/profile/ArticlesPage';
import {
  GET_OWN_ARTICLES_QUERY,
  OWN_ARTICLES_INITIAL_FILTER,
} from '#/profile/_graphql/GetOwnArticles';

export default async function ArticlesRoute() {
  const client = await getClient();
  const { data, error } = await client.query({
    query: GET_OWN_ARTICLES_QUERY,
    variables: { filter: OWN_ARTICLES_INITIAL_FILTER },
  });

  return (
    <ArticlesPage
      initialArticles={data?.articles ?? []}
      error={error ?? null}
    />
  );
}
