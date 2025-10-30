import { CategoryModel } from 'model/CategoryModel';
import { isExternalUrl } from './isExternalUrl';

/**
 * Checks if a category has an external redirect URL.
 * @param category - The category to check
 * @returns true if the category has an external redirect, false otherwise
 */
export const isCategoryExternalRedirect = (
  category: CategoryModel
): boolean => {
  return !!category.redirect && isExternalUrl(category.redirect);
};
