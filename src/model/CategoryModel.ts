import { FileModel } from './FileModel';
import { UserGroupModel } from './UserGroupModel';
import { ID } from './ID';

export interface CategoryModel {
    id: ID;
    title: string;
    sortKey: number;
    redirect?: string;
    group?: UserGroupModel;
    bannerImageFile?: FileModel;
    category?: CategoryModel;
}
