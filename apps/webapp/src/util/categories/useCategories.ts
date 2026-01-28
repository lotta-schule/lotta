import React from 'react';
import { CategoryModel } from 'model';
import { useQuery } from '@apollo/client/react';
import GetCategoriesQuery from 'api/query/GetCategoriesQuery.graphql';

export const useCategories = () => {
  const { data } = useQuery<{ categories: CategoryModel[] }>(
    GetCategoriesQuery
  );

  const categories = React.useMemo(
    () =>
      (data?.categories ?? []).toSorted((a, b) => {
        const isHomepageV =
          a.isHomepage === b.isHomepage ? 0 : a.isHomepage ? -1 : 1;
        const isSidenavV =
          a.isSidenav === b.isSidenav ? 0 : a.isSidenav ? 1 : -1;
        return isHomepageV || isSidenavV || a.sortKey - b.sortKey;
      }),
    [data?.categories]
  );

  const withIndentedLabels = React.useMemo(
    () =>
      categories
        .filter((c) => !c.category)
        .flatMap((c) => [
          c,
          ...categories
            .filter((subC) => subC.category?.id === c.id)
            .sort((a, b) => a.sortKey - b.sortKey),
        ])
        .map((category) => {
          const indent = category.category ? '⎯ ' : '';
          return {
            category,
            indentedLabel: indent + category.title,
          };
        }),
    [categories]
  );

  const others = React.useMemo(
    () => ({ withIndentedLabels }),
    [withIndentedLabels]
  );
  return React.useMemo(
    () => [categories, others] as const,
    [categories, others]
  );
};
