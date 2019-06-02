import { CategoryModel } from './CategoryModel';
import { ContentModuleModel } from './ContentModuleModel';

export interface ArticleModel {
    id: string;
    insertedAt: string;
    updatedAt: string;
    title: string;
    preview?: string;
    previewImageUrl?: string;
    modules: ContentModuleModel[];
    category?: CategoryModel;
    pageName?: string;
}
