import { FileModel } from './FileModel';
import { UserGroupModel } from './UserGroupModel';
import { WidgetModel } from './WidgetModel';
import { ID } from './ID';

export interface CategoryModel {
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
