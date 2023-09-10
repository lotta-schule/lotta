import { UserGroupModel } from './UserGroupModel';
import { ID } from './ID';
import { FileModel } from 'model';

export interface UserModel {
  id: ID;
  insertedAt: string;
  updatedAt: string;
  lastSeen: string;
  name?: string;
  nickname: string;
  hideFullName: boolean;
  email: string;
  class?: string;
  phone?: string;
  unreadMessages?: number;
  assignedGroups?: UserGroupModel[];
  groups: UserGroupModel[];
  avatarImageFile?: FileModel | null;
  enrollmentTokens?: string[];
  hasChangedDefaultPassword?: boolean;
}
