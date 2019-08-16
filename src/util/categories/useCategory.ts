import { CategoryModel } from 'model';
import { useCategories } from './useCategories';
import { find } from 'lodash';
import { ID } from 'model/ID';

export const useCategory = (categoryId: ID): CategoryModel | null => {
    return find<CategoryModel>(useCategories(), (category: CategoryModel) => category.id === categoryId) || null;
}