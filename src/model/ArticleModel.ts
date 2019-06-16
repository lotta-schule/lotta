import { CategoryModel } from './CategoryModel';
import { ContentModuleModel } from './ContentModuleModel';

export interface ArticleModel {
    id: string;
    insertedAt: string;
    updatedAt: string;
    title: string;
    preview?: string;
    previewImageUrl?: string;
    contentModules: ContentModuleModel[];
    category?: CategoryModel;
    pageName?: string;
}
