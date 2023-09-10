import { CategoryModel } from './CategoryModel';
import { ContentModuleModel, ContentModuleInput } from './ContentModuleModel';
import { UserModel } from './UserModel';
import { FileModel } from './FileModel';
import { ID } from './ID';
import { UserGroupModel } from './UserGroupModel';

export interface ArticleModel {
  id: ID;
  insertedAt: string;
  updatedAt: string;
  title: string;
  preview?: string;
  readyToPublish: boolean;
  published: boolean;
  isPinnedToTop: boolean;
  tags: string[];
  previewImageFile?: FileModel | null;
  contentModules: ContentModuleModel[];
  users: UserModel[];
  category?: CategoryModel | null;
  groups: UserGroupModel[];
}

export type ArticleModelInput = Omit<
  ArticleModel,
  'id' | 'insertedAt' | 'updatedAt' | 'contentModules' | 'category'
> & {
  contentModules: ContentModuleInput[];
  category: Partial<CategoryModel>;
};

export type ArticleFilter = {
  first?: number;
  updated_before?: Date;
};
