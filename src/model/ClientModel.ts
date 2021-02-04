import { FileModel } from './FileModel';
import { UserGroupModel } from './UserGroupModel';
import { CustomDomainModel } from './CustomDomainModel';

export interface ClientModel {
    insertedAt: string;
    updatedAt: string;
    slug: string;
    title: string;
    host: string;
    userMaxStorageConfig: number;
    customTheme?: any;
    groups: UserGroupModel[];
    logoImageFile?: FileModel | null;
    backgroundImageFile?: FileModel | null;
    customDomains: CustomDomainModel[];
}
