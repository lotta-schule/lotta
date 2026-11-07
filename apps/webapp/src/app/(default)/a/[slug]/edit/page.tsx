import { notFound } from 'next/navigation.js';
import { Main, Sidebar } from '#/layout';
import { EditArticlePageWrapper } from '#/article/EditArticlePageWrapper';
import { loadArticle, loadCurrentUser } from '#/loader';
import { User } from '#/util/model';

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

  const article = await loadArticle(articleId);

  if (!article) {
    notFound();
  }

  const currentUser = await loadCurrentUser();
  const canEditArticle =
    User.canEditArticle(currentUser, article) || User.isAdmin(currentUser);

  if (!canEditArticle) {
    notFound();
  }

  return (
    <>
      <Main>
        <EditArticlePageWrapper article={article} />
      </Main>
      <Sidebar isEmpty />
    </>
  );
}
