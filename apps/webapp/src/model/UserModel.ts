import { UserGroupModel } from './UserGroupModel';
import { ID } from './ID';
import { FileModel } from 'model';

export interface UserModel {
  __typename?: 'User';
  id: ID;
  insertedAt: string;
  updatedAt: string;
  lastSeen: string | null;
  name: string | null;
  nickname: string | null;
  hideFullName: boolean;
  email: string | null;
  class: string | null;
  unreadMessages: number | null;
  assignedGroups?: UserGroupModel[];
  groups: UserGroupModel[];
  avatarImageFile?: FileModel | null;
  enrollmentTokens?: string[];
  hasChangedDefaultPassword?: boolean;
}
