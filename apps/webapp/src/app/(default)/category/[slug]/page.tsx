import { query } from '#/api/client.js';
import { CategoryPage } from '../_component/index.js';
import { loadCategories, loadTenant } from '#/loader/index.js';
import { notFound } from 'next/navigation.js';
import { GET_ARTICLES_QUERY } from '../_component/categoryPage/_graphql/index.js';

export default async function CategoryRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const rawCategoryId = slug?.replace(/^(\d+).*/, '$1');

  if (!rawCategoryId) {
    throw notFound();
  }

  const [, categories] = await Promise.all([loadTenant(), loadCategories()]);

  const category = categories.find((cat) => cat.id === rawCategoryId);

  if (!category) {
    throw notFound();
  }

  const articles = await query({
    query: GET_ARTICLES_QUERY,
    variables: {
      categoryId: category.id,
      filter: { first: 10 },
    },
  }).then((result) => result.data?.articles ?? []);

  return <CategoryPage initialArticles={articles} category={category} />;
}
