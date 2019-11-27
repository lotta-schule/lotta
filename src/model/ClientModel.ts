import { FileModel } from './FileModel';
import { UserGroupModel } from './UserGroupModel';
import { CustomDomainModel } from './CustomDomainModel';
import { ID } from './ID';

export interface ClientModel {
    id: ID;
    createdAt: string;
    updatedAt: string;
    slug: string;
    title: string;
    customTheme?: any;
    groups: UserGroupModel[];
    logoImageFile?: FileModel;
    backgroundImageFile?: FileModel;
    customDomains: CustomDomainModel[];
}
