import { UserGroupModel } from './UserGroupModel';
import { ID } from './ID';

export interface ClientModel {
    id: ID;
    createdAt: string;
    updatedAt: string;
    slug: string;
    title: string;
    groups: UserGroupModel[];
}
