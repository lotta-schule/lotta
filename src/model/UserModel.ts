import { UserGroupModel } from './UserGroupModel';
import { ID } from './ID';

export interface UserModel {
    id: ID;
    name: string;
    nickname: string;
    email: string;
    groups: UserGroupModel[];
    avatar?: string;
    class?: string;
    phone?: string;
}
