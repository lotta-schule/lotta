import { useSelector } from 'react-redux';
import { State } from 'store/State';
import { CategoryModel } from 'model';
import { useMemo } from 'react';

export const useCategories = (): CategoryModel[] => {
    const categories = useSelector<State, CategoryModel[]>(state => state.client.categories);
    return useMemo(() => categories.sort((cat1, cat2) => cat1.sortKey - cat2.sortKey), [categories]);
}