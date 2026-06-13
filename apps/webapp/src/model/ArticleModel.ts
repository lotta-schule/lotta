import { CategoryModel } from './CategoryModel';
import { ContentModuleModel, ContentModuleInput } from './ContentModuleModel';
import { UserModel, UserPreviewModel } from './UserModel';
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
  // Nullability aligned with the GraphQL schema (these were stale: `null` not
  // `undefined`, and the booleans/tags are schema-nullable).
  preview?: string | null;
  readyToPublish: boolean | null;
  published: boolean | null;
  isReactionsEnabled?: boolean;
  isPinnedToTop: boolean | null;
  tags: string[] | null;
  previewImageFile?: FileModel | null;
  // Required on the full model (editors/detail). Preview selections omit these —
  // see `ArticlePreviewModel`, which `Omit`s them.
  contentModules: ContentModuleModel[];
  users: UserModel[];
  category?: CategoryModel | null;
  groups: UserGroupModel[];
  reactionCounts?: {
    type: ArticleReactionType;
    count: number;
  }[];
}

/**
 * The shape returned by article *preview* selections (lists): omits the heavy
 * `contentModules`/`groups` and carries the light `UserPreviewModel` for authors.
 * A full `ArticleModel` is assignable to this, so preview components/helpers should
 * accept `ArticlePreviewModel` (or be generic over `A extends ArticlePreviewModel`).
 */
export type ArticlePreviewModel = Omit<
  ArticleModel,
  'contentModules' | 'groups' | 'users' | 'category' | 'isPinnedToTop'
> & {
  users: UserPreviewModel[];
  // Preview selections pick a light category; `title` isn't always selected.
  category?: { id: string | null; title?: string | null } | null;
  // Not selected by every preview query.
  isPinnedToTop?: boolean | null;
};

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
