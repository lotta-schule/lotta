import { UserGroupModel } from './UserGroupModel.js';
import { UserModel } from './UserModel.js';
import { ID } from './ID.js';
import { FileModel } from './FileModel.js';

export type NewMessageDestination =
  | { group: UserGroupModel; user?: never }
  | { user: UserModel; group?: never };

export interface ConversationModel {
  __typename?: 'Conversation';
  id: ID;
  insertedAt: string;
  updatedAt: string;
  unreadMessages?: number;
  groups: UserGroupModel[];
  users: UserModel[];
  messages: MessageModel[];
}

export interface MessageModel {
  __typename?: 'Message';
  id: ID;
  insertedAt: string;
  updatedAt: string;
  content: string;
  files?: FileModel[];
  user: UserModel;
  conversation?: ConversationModel;
}
