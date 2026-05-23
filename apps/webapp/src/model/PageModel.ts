import { ArticleModel } from './ArticleModel.js';
import { CategoryModel } from './CategoryModel.js';
import { ContentModuleModel } from './ContentModuleModel.js';
import { ID } from './ID.js';

export interface PageModel {
  __typename?: 'Page';
  id: ID;
  title: string;
  preview?: string;
  category?: CategoryModel;
  modules: ContentModuleModel[];
  articles: ArticleModel[];
}
