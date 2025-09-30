import { CategoryPage } from 'category/CategoryPage';

export default async function CategoryRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const rawCategoryId = slug?.replace(/^(\d+).*/, '$1');
  const categoryId = rawCategoryId === '0' ? null : (rawCategoryId ?? null);

  return <CategoryPage categoryId={categoryId} />;
}
