import { CategoryModel } from 'model';
import { useCategories } from './useCategories';
import { ID } from 'model/ID';

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
