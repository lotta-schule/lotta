import { notFound } from 'next/navigation.js';
import { Main, Sidebar } from '#/layout';
import { ArticlePage } from '#/article/ArticlePage';
import { loadArticle } from '#/loader';

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

  const article = await loadArticle(articleId);

  if (!article) {
    notFound();
  }

  return (
    <>
      <Main>
        <ArticlePage article={article} />
      </Main>
      <Sidebar isEmpty />
    </>
  );
}
