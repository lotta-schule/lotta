import { CategoryModel } from 'model';
import slugify from 'slugify';

export enum RedirectType {
    None = 'None',
    InternalCategory = 'InternalCategory',
    InternalArticle = 'InternalArticle',
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
        if (/^\/c/.test(category.redirect)) {
            return RedirectType.InternalCategory;
        }
        if (/^\/a/.test(category.redirect)) {
            return RedirectType.InternalArticle;
        }
        return RedirectType.Extern;
    },
};
