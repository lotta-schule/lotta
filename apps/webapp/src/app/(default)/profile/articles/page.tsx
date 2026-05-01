import { getClient } from '#/api/client.js';
import { ArticleModel } from '#/model/index.js';
import { ArticlesPage } from '#/profile/ArticlesPage.js';

import GetOwnArticlesQuery from '#/api/query/GetOwnArticles.graphql';

export default async function ArticlesRoute() {
  const client = await getClient();
  const { data, error } = await client.query<{ articles: ArticleModel[] }>({
    query: GetOwnArticlesQuery,
  });

  return <ArticlesPage articles={data?.articles} error={error ?? null} />;
}
