import { notFound } from 'next/navigation';
import { getClient } from 'api/client';
import { Main, Sidebar } from 'layout';
import { ArticleModel, ID } from 'model';
import { ArticlePage } from 'article/ArticlePage';

import GetArticleQuery from 'api/query/GetArticleQuery.graphql';

export default async function ArticleRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const articleId = slug?.replace(/^(\d+).*/, '$1');

  if (!articleId) {
    notFound();
  }

  const client = await getClient();
  const { data } = await client.query<{ article: ArticleModel }, { id: ID }>({
    query: GetArticleQuery,
    variables: { id: articleId },
  });

  if (!data?.article) {
    notFound();
  }

  return (
    <>
      <Main>
        <ArticlePage article={data.article} />
      </Main>
      <Sidebar isEmpty />
    </>
  );
}
