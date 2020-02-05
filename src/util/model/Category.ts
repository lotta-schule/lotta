import { CategoryModel } from 'model';
import slugify from 'slugify';

export const Category = {
    getPath(category: CategoryModel) {
        return `/c/${category.id}-${slugify(category.title)}`;
    },
};
