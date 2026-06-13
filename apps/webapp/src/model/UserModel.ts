import { UserGroupModel } from './UserGroupModel';
import { ID } from './ID';
import { FileModel } from '#/model';

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
  hasChangedDefaultPassword?: boolean | null;
}

/**
 * The light user shape selected by *preview* queries (article authors, message
 * senders, …). A full `UserModel` is assignable to this, so preview components
 * (`UserAvatar`, `AuthorAvatarsList`, …) should accept `UserPreviewModel`.
 */
export type UserPreviewModel = Pick<
  UserModel,
  '__typename' | 'id' | 'name' | 'nickname' | 'avatarImageFile'
>;
