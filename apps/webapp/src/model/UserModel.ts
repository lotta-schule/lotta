import { UserGroupModel } from './UserGroupModel.js';
import { ID } from './ID.js';
import { FileModel } from '#/model/index.js';

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
