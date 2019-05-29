import { useSelector } from 'react-redux';
import { State } from 'store/State';
import { CategoryModel } from 'model';

export const useCategoriesAncestorsForItem = (categoryId: string): string[] => {
    const categories = useSelector<State, CategoryModel[]>(state => state.content.categories);
    let categoriesHierarchy: string[] = [];
    let lastFoundCategory: CategoryModel | null = null;
    for (let i = 0; i < 5; i++) { // max 5 levels
        const currentLevelCategoryId = (lastFoundCategory ? lastFoundCategory.categoryId : categoryId) as string | undefined;
        if (!currentLevelCategoryId) {
            break;
        }
        lastFoundCategory = categories.find(category => category.id === currentLevelCategoryId) || null;
        if (lastFoundCategory && lastFoundCategory.categoryId) {
            categoriesHierarchy = [lastFoundCategory.categoryId, ...categoriesHierarchy];
        } else {
            break;
        }
    }
    return categoriesHierarchy;
}