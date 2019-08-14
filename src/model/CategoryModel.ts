import { FileModel } from './FileModel';
import { UserGroupModel } from './UserGroupModel';

export interface CategoryModel {
    id: string;
    title: string;
    sortKey: number;
    redirect?: string;
    group?: UserGroupModel;
    bannerImageFile?: FileModel;
    category?: CategoryModel;
}
