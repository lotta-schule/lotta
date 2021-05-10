import { CategoryModel } from 'model';
import slugify from 'slugify';

export enum RedirectType {
    None = 'None',
    Intern = 'Intern',
    Extern = 'Extern',
}

export const Category = {
    getPath(category: CategoryModel) {
        return `/c/${category.id}-${slugify(category.title)}`;
    },
    getRedirectType(category?: CategoryModel | null): RedirectType {
        if (
            !category ||
            category.redirect === null ||
            category.redirect === undefined
        ) {
            return RedirectType.None;
        }
        return /^\//.test(category.redirect)
            ? RedirectType.Intern
            : RedirectType.Extern;
    },
};
