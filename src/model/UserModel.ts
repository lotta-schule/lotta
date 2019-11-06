import { UserGroupModel } from './UserGroupModel';
import { ID } from './ID';
import { FileModel } from 'model';

export interface UserModel {
    id: ID;
    createdAt: string;
    updatedAt: string;
    lastSeen: string;
    name: string;
    nickname: string;
    email: string;
    groups: UserGroupModel[];
    avatarImageFile?: FileModel;
    class?: string;
    phone?: string;
}
