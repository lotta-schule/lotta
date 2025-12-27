import { CategoryModel } from 'model';
import { useQuery } from '@apollo/client/react';
import GetCategoriesQuery from 'api/query/GetCategoriesQuery.graphql';

export const useCategories = (): [CategoryModel[]] => {
  const { data } = useQuery<{ categories: CategoryModel[] }>(
    GetCategoriesQuery
  );

  // TODO: Server's job
  const categories = [...(data?.categories ?? [])].sort(
    (cat1, cat2) => cat1.sortKey - cat2.sortKey
  );
  return [categories];
};
