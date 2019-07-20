import { CategoryModel } from './CategoryModel';
import { ContentModuleModel, ContentModuleInput } from './ContentModuleModel';
import { UserModel } from './UserModel';
import { FileModel } from './FileModel';

export interface ArticleModel {
    id: string;
    insertedAt: string;
    updatedAt: string;
    title: string;
    preview?: string;
    previewImageFile?: FileModel;
    contentModules: ContentModuleModel[];
    category?: CategoryModel;
    user?: UserModel;
    pageName?: string;
}

export type UpdateArticleModelInput = Omit<ArticleModel, 'id' | 'insertedAt' | 'updatedAt' | 'contentModules' | 'category'> & {
    contentModules: ContentModuleInput[]
};

export type CreateArticleModelInput = UpdateArticleModelInput & { categoryId: string | null };