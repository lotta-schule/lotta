import { ArticleModel } from '#/model/index.js';
import slugify from 'slugify';

export const Article = {
  getPath(article: ArticleModel, options?: { edit?: boolean }) {
    return `/a/${article.id}-${slugify(article.title)}${
      options?.edit ? '/edit' : ''
    }`;
  },
};
