import { CategoryModel } from 'model';
import { useQuery } from '@apollo/react-hooks';
import { GetCategoriesQuery } from 'api/query/GetCategoriesQuery';
import { QueryResult } from 'react-apollo';

export const useCategories = (): [CategoryModel[], QueryResult<{ categories: CategoryModel[] }>] => {
    const queryResult = useQuery<{ categories: CategoryModel[] }>(GetCategoriesQuery);
    const categories = queryResult.data && queryResult.data.categories ?
        queryResult.data.categories.sort((cat1, cat2) => cat1.sortKey - cat2.sortKey) :
        [];
    return [categories, queryResult];
}