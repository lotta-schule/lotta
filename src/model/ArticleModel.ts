import { CategoryModel } from './CategoryModel';
import { ContentModuleModel, ContentModuleInput } from './ContentModuleModel';
import { UserModel } from './UserModel';
import { FileModel } from './FileModel';
import { ID } from './ID';

export interface ArticleModel {
    id: ID;
    insertedAt: string;
    updatedAt: string;
    title: string;
    preview?: string;
    readyToPublish: boolean;
    isPinnedToTop: boolean;
    topic?: string;
    previewImageFile?: FileModel;
    contentModules: ContentModuleModel[];
    users: UserModel[];
    category?: CategoryModel;
}

export type ArticleModelInput = Omit<ArticleModel, 'id' | 'insertedAt' | 'updatedAt' | 'contentModules' | 'category'> & {
    contentModules: ContentModuleInput[];
    category: Partial<CategoryModel>;
};