import { query } from 'api/client';
import { CategoryPage } from '../_component';
import { loadCategories, loadTenant } from 'loader';
import { notFound } from 'next/navigation';
import { GET_ARTICLES_QUERY } from '../_component/categoryPage/_graphql';

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
