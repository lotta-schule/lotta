import { CategoryModel } from '#/model';
import slugify from 'slugify';

export enum RedirectType {
  None = 'None',
  InternalCategory = 'InternalCategory',
  InternalArticle = 'InternalArticle',
  Extern = 'Extern',
}

export const Category = {
  getPath(category: { id: string | null; title?: string | null }) {
    return `/c/${category.id}-${slugify(category.title ?? '')}`;
  },
  getRedirectType(category?: CategoryModel | null): RedirectType {
    if (
      !category ||
      category.redirect === null ||
      category.redirect === undefined
    ) {
      return RedirectType.None;
    }
    if (category.redirect.startsWith('/c')) {
      return RedirectType.InternalCategory;
    }
    if (category.redirect.startsWith('/a')) {
      return RedirectType.InternalArticle;
    }
    return RedirectType.Extern;
  },
};
