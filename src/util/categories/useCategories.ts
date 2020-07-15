import { CategoryModel } from 'model';
import { useQuery, QueryResult  } from '@apollo/client';
import { GetCategoriesQuery } from 'api/query/GetCategoriesQuery';

export const useCategories = (): [CategoryModel[], QueryResult<{ categories: CategoryModel[] }>] => {
    const queryResult = useQuery<{ categories: CategoryModel[] }>(GetCategoriesQuery);
    const categories = [...(queryResult.data?.categories ?? [])].sort((cat1, cat2) => cat1.sortKey - cat2.sortKey);
    return [categories, queryResult];
}
