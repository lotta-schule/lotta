import { ArticleModel } from '#/model';
import slugify from 'slugify';

export const Article = {
  getPath(
    article: Pick<ArticleModel, 'id' | 'title'>,
    options?: { edit?: boolean }
  ) {
    return `/a/${article.id}-${slugify(article.title)}${
      options?.edit ? '/edit' : ''
    }`;
  },
};
