import { ClientModel } from "./ClientModel";

export interface UserGroupModel {
    id: string;
    createdAt: string;
    updatedAt: string;
    name: string;
    isAdminGroup: boolean;
    tenant: ClientModel;
}
