import { FileModel } from './FileModel';
import { UserGroupModel } from './UserGroupModel';

export interface TenantModel {
    id: string;
    insertedAt: string;
    updatedAt: string;
    slug: string;
    title: string;
    host: string;
    groups: UserGroupModel[];
    configuration: {
        userMaxStorageConfig: string;
        customTheme?: any;
        logoImageFile?: FileModel | null;
        backgroundImageFile?: FileModel | null;
    };
}
