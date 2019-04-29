import { ArticleModel } from './ArticleModel';
import { CategoryModel } from './CategoryModel';
import { ContentModuleModel } from './ContentModuleModel';

export interface PageModel {
    id: string;
    title: string;
    preview?: string;
    category?: CategoryModel;
    modules: ContentModuleModel[];
    articles: ArticleModel[];
}
