import { getClient } from 'api/client';
import { ArticleModel } from 'model';
import { UnpublishedArticlesPage } from 'article/UnpublishedArticlesPage';

import GetUnpublishedArticlesQuery from 'api/query/GetUnpublishedArticlesQuery.graphql';

export default async function UnpublishedRoute() {
  const client = await getClient();
  const { data, error } = await client.query<{ articles: ArticleModel[] }>({
    query: GetUnpublishedArticlesQuery,
  });

  return (
    <UnpublishedArticlesPage articles={data?.articles} error={error ?? null} />
  );
}
