import { notFound } from 'next/navigation.js';
import { getClient } from '#/api/client.js';
import { Main, Sidebar } from '#/layout/index.js';
import { ArticleModel, ID } from '#/model/index.js';
import { EditArticlePageWrapper } from '#/article/EditArticlePageWrapper.js';
import { loadCurrentUser } from '#/loader/index.js';
import { User } from '#/util/model/index.js';

import GetArticleQuery from '#/api/query/GetArticleQuery.graphql';

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
