import { getClient } from 'api/client';
import { ArticleModel } from 'model';
import { ArticlesPage } from 'profile/ArticlesPage';

import GetOwnArticlesQuery from 'api/query/GetOwnArticles.graphql';

export default async function ArticlesRoute() {
  const client = await getClient();
  const { data, error } = await client.query<{ articles: ArticleModel[] }>({
    query: GetOwnArticlesQuery,
  });

  return <ArticlesPage articles={data?.articles} error={error ?? null} />;
}
