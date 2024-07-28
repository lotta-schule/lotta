import { CategoryModel } from './CategoryModel';
import { ContentModuleModel, ContentModuleInput } from './ContentModuleModel';
import { UserModel } from './UserModel';
import { FileModel } from './FileModel';
import { ID } from './ID';
import { UserGroupModel } from './UserGroupModel';

export type ArticleReactionType =
  | 'HEART'
  | 'HEART_CRACK'
  | 'FACE_SMILE'
  | 'FACE_FLUSHED'
  | 'LEMON'
  | 'PEPPER'
  | 'THUMB_UP'
  | 'SKULL';

export interface ArticleModel {
  __typename?: 'Article';
  id: ID;
  insertedAt: string;
  updatedAt: string;
  title: string;
  preview?: string;
  readyToPublish: boolean;
  published: boolean;
  isReactionsEnabled?: boolean;
  isPinnedToTop: boolean;
  tags: string[];
  previewImageFile?: FileModel | null;
  contentModules: ContentModuleModel[];
  users: UserModel[];
  category?: CategoryModel | null;
  groups: UserGroupModel[];
  reactionCounts?: {
    type: ArticleReactionType;
    count: number;
  }[];
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
