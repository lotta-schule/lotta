import { CategoryModel } from 'model';
import { useQuery } from '@apollo/react-hooks';
import { GetCategoriesQuery } from 'api/query/GetCategoriesQuery';

export const useCategories = (): CategoryModel[] => {
    const { data } = useQuery<{ categories: CategoryModel[] }>(GetCategoriesQuery);
    if (data && data.categories) {
        return data.categories.sort((cat1, cat2) => cat1.sortKey - cat2.sortKey);
    } else {
        return [];
    }
}