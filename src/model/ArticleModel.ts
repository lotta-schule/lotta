import { CategoryModel } from './CategoryModel';
import { ContentModuleModel, ContentModuleInput } from './ContentModuleModel';

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

export type UpdateArticleModelInput = Omit<ArticleModel, 'id' | 'insertedAt' | 'updatedAt' | 'contentModules' | 'category'> & {
    contentModules: ContentModuleInput[]
};

export type CreateArticleModelInput = UpdateArticleModelInput & { categoryId: string | null };