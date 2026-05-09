import { CategoryModel } from '#/model/index.js';
import { useCategories } from './useCategories.js';
import { ID } from '#/model/ID.js';

export const useCategory = (
  categoryId: ID | null | undefined
): CategoryModel | null => {
  const [allCategories] = useCategories();
  const category = categoryId
    ? allCategories.find(
        (category: CategoryModel) => category.id === categoryId
      )
    : allCategories.find((category) => !!category.isHomepage);

  return category || null;
};
