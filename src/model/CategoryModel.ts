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
    redirect?: string;
    hideArticlesFromHomepage?: boolean;
    group?: UserGroupModel;
    bannerImageFile?: FileModel;
    category?: CategoryModel;
    widgets?: WidgetModel[];
}
