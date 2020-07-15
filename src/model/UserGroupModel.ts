import { ClientModel } from './ClientModel';
import { GroupEnrollmentTokenModel } from './GroupEnrollmentTokenModel';
import { ID } from './ID';

export interface UserGroupModel {
    id: ID;
    insertedAt: string;
    updatedAt: string;
    name: string;
    isAdminGroup: boolean;
    sortKey: number;
    tenant: ClientModel;
    enrollmentTokens: GroupEnrollmentTokenModel[];
}

export interface UserGroupInputModel {
    name: string;
    isAdminGroup?: boolean;
    sortKey?: number;
    enrollmentTokens?: string[];
}
