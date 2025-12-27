import * as React from 'react';
import { getClient } from 'api/client';
import { CategoryModel } from 'model';

import GetCategoriesQuery from 'api/query/GetCategoriesQuery.graphql';

export const loadCategories = React.cache(async () => {
  const client = await getClient();
  return await client
    .query<{ categories: CategoryModel[] }>({
      query: GetCategoriesQuery,
    })
    .then(({ data }) => data?.categories ?? []);
});
