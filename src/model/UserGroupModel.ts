import { ID } from './ID';

export interface UserGroupModel {
    id: ID;
    insertedAt: string;
    updatedAt: string;
    name: string;
    isAdminGroup: boolean;
    sortKey: number;
    enrollmentTokens: string[];
}

export interface UserGroupInputModel {
    name: string;
    isAdminGroup?: boolean;
    sortKey?: number;
    enrollmentTokens?: string[];
}
