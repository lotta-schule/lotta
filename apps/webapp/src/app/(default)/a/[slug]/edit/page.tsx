import { notFound } from 'next/navigation';
import { getClient } from 'api/client';
import { Main, Sidebar } from 'layout';
import { ArticleModel, ID } from 'model';
import { EditArticlePageWrapper } from 'article/EditArticlePageWrapper';
import { loadCurrentUser } from 'loader';
import { User } from 'util/model';

import GetArticleQuery from 'api/query/GetArticleQuery.graphql';

export default async function EditArticleRoute({
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

  const currentUser = await loadCurrentUser();
  const canEditArticle =
    User.canEditArticle(currentUser, data.article) || User.isAdmin(currentUser);

  if (!canEditArticle) {
    notFound();
  }

  return (
    <>
      <Main>
        <EditArticlePageWrapper article={data.article} />
      </Main>
      <Sidebar isEmpty />
    </>
  );
}
