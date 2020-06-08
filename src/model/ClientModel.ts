import { FileModel } from './FileModel';
import { UserGroupModel } from './UserGroupModel';
import { CustomDomainModel } from './CustomDomainModel';
import { ID } from './ID';

export interface ClientModel {
    id: ID;
    insertedAt: string;
    updatedAt: string;
    slug: string;
    title: string;
    customTheme?: any;
    groups: UserGroupModel[];
    logoImageFile?: FileModel | null;
    backgroundImageFile?: FileModel | null;
    customDomains: CustomDomainModel[];
}
