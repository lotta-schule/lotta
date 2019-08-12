import { UserGroupModel } from "./UserGroupModel";

export interface ClientModel {
    id: string;
    createdAt: string;
    updatedAt: string;
    slug: string;
    title: string;
    groups: UserGroupModel[];
}
