import { cache } from 'react';
import { getClient } from 'api/client';
import { CategoryModel } from 'model';

import GetCategoriesQuery from 'api/query/GetCategoriesQuery.graphql';

export const loadCategories = cache(async () => {
  const categories = await getClient()
    .query<{ categories: CategoryModel[] }>({
      query: GetCategoriesQuery,
    })
    .then(({ data }) => data?.categories ?? []);

  return categories;
});
