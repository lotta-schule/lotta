import { query } from 'api/client';
import { CategoryPage } from './category/_component';
import { GET_ARTICLES_QUERY } from './category/_component/categoryPage/_graphql';
import { loadTenant, loadCategories } from 'loader';

export default async function HomeRoute() {
  const [, categories] = await Promise.all([loadTenant(), loadCategories()]);

  const category = categories.find((cat) => cat.isHomepage);

  if (!category) {
    throw new Error('No homepage category found');
  }

  const articles = await query({
    query: GET_ARTICLES_QUERY,
    variables: {
      categoryId: category.id,
      filter: { first: 10 },
    },
  }).then((result: any) => result.data.articles ?? []);

  return <CategoryPage initialArticles={articles} category={category} />;
}
