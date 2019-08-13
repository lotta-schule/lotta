import { UserGroupModel } from "./UserGroupModel";

export interface UserModel {
    id: string;
    name: string;
    nickname: string;
    email: string;
    groups: UserGroupModel[];
    avatar?: string;
    class?: string;
    phone?: string;
}
