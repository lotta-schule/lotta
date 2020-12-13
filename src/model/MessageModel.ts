import { UserGroupModel } from './UserGroupModel';
import { UserModel } from './UserModel';
import { ID } from './ID';

export enum ChatType {
    DirectMessage = 'DM',
    GroupChat = 'GC'
}

interface MessageToUser {
    recipientUser: UserModel;
    recipientGroup?: undefined;
    messageType: ChatType.DirectMessage;
}

interface MessageToGroup {
    recipientUser?: undefined;
    recipientGroup: UserGroupModel;
    messageType: ChatType.GroupChat;
}

export type MessageToEitherUserOrGroup = MessageToUser | MessageToGroup;

interface MessageWithoutDestination {
    id: ID;
    insertedAt: string;
    updatedAt: string;
    content: string;
    senderUser: UserModel;
}

export type MessageModel = MessageWithoutDestination & MessageToEitherUserOrGroup;

export interface ThreadRepresentation {
    messageType: ChatType;
    counterpart: UserModel | UserGroupModel;
}
