import { CategoryModel } from './CategoryModel';
import { ContentModuleModel } from './ContentModuleModel';

export interface ArticleModel {
    id: string;
    title: string;
    preview?: string;
    category?: CategoryModel;
    modules: ContentModuleModel[];
}
