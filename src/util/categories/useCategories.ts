import { useSelector } from 'react-redux';
import { State } from 'store/State';
import { CategoryModel } from 'model';

export const useCategories = (): CategoryModel[] => {
    return useSelector<State, CategoryModel[]>(state => state.client.categories);
}