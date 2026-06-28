import { query } from '#/api/client';
import { CategoryPage } from '../_component';
import { loadCategories, loadTenant } from '#/loader';
import { notFound } from 'next/navigation.js';
import { GET_ARTICLES_QUERY } from '../_component/categoryPage/_graphql';

export default async function CategoryRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  void loadTenant();
  const { slug } = await params;
  const rawCategoryId = slug?.replace(/^(\d+).*/, '$1');

  if (!rawCategoryId) {
    throw notFound();
  }

  const categories = await loadCategories(); // TODO: We probably need much less about these categories here
  const category = categories.find((cat) => cat.id === rawCategoryId);

  if (!category) {
    throw notFound();
  }

  const articlesPromise = query({
    query: GET_ARTICLES_QUERY,
    variables: {
      categoryId: category.id,
      filter: { first: 10 },
    },
  });

  const articles = await articlesPromise.then(
    (result) => result.data?.articles ?? []
  );

  return <CategoryPage initialArticles={articles} category={category} />;
}
