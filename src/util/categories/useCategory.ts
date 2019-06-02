import { CategoryModel } from 'model';
import { useCategories } from './useCategories';
import { find } from 'lodash';

export const useCategory = (categoryId: string): CategoryModel | null => {
    return find<CategoryModel>(useCategories(), (category: CategoryModel) => category.id === categoryId) || null;
}