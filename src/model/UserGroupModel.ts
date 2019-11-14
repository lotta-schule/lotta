import { ClientModel } from './ClientModel';
import { ID } from './ID';

export interface UserGroupModel {
    id: ID;
    createdAt: string;
    updatedAt: string;
    name: string;
    sortKey: number;
    isAdminGroup: boolean;
    tenant: ClientModel;
}
