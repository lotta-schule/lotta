import { FileModel } from './FileModel.js';
import { UserGroupModel } from './UserGroupModel.js';
import { WidgetModel } from './WidgetModel.js';
import { ID } from './ID.js';

export interface CategoryModel {
  __typename?: 'Category';
  id: ID;
  title: string;
  sortKey: number;
  isSidenav?: boolean;
  isHomepage?: boolean;
  redirect?: string | null;
  hideArticlesFromHomepage?: boolean;
  layoutName?: 'standard' | 'densed' | '2-columns' | null;
  groups: UserGroupModel[];
  bannerImageFile?: FileModel | null;
  category?: CategoryModel | null;
  widgets?: WidgetModel[];
}
