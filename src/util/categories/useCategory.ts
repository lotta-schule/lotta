import { CategoryModel } from 'model';
import { useCategories } from './useCategories';
import { find } from 'lodash';
import { ID } from 'model/ID';

export const useCategory = (categoryId?: ID): CategoryModel | null => {
    const [allCategories] = useCategories();
    return categoryId ?
        find<CategoryModel>(allCategories, (category: CategoryModel) => category.id === categoryId) || null :
        find<CategoryModel>(allCategories, category => !!category.isHomepage) || null;
}