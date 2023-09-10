import { CategoryModel } from 'model';
import { useCategories } from './useCategories';
import find from 'lodash/find';
import { ID } from 'model/ID';

export const useCategory = (
  categoryId: ID | null | undefined
): CategoryModel | null => {
  const [allCategories] = useCategories();
  return categoryId
    ? find<CategoryModel>(
        allCategories,
        (category: CategoryModel) => category.id === categoryId
      ) || null
    : find<CategoryModel>(allCategories, (category) => !!category.isHomepage) ||
        null;
};
