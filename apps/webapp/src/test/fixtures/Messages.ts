import { ConversationModel, NewMessageDestination, UserModel } from 'model';

export const createConversation = (
  from: UserModel,
  { user, group }: NewMessageDestination,
  unreadMessages = 0
): ConversationModel => {
  return {
    __typename: 'Conversation',
    id: String(Math.floor(Math.random() * 10_000)),
    insertedAt: '2020-11-28T07:37:02',
    updatedAt: '2020-11-28T07:37:02',
    unreadMessages,
    users: user ? [from, user] : [],
    groups: group ? [group] : [],
    messages: [
      {
        __typename: 'Message',
        id: String(Math.floor(Math.random() * 10_000)),
        insertedAt: '2020-11-28T07:37:02',
        updatedAt: '2020-11-28T07:37:02',
        content: 'Hallo',
        user: from,
        files: [],
      },
      {
        __typename: 'Message',
        id: String(Math.floor(Math.random() * 10_000)),
        insertedAt: '2020-11-28T07:32:14',
        updatedAt: '2020-11-28T07:32:14',
        content: 'Hallo',
        user: from,
        files: [],
      },
      {
        __typename: 'Message',
        id: String(Math.floor(Math.random() * 1000)),
        insertedAt: '2020-11-28T07:29:31',
        updatedAt: '2020-11-28T07:29:31',
        content: 'Hallo',
        user: from,
        files: [],
      },
      {
        __typename: 'Message',
        id: String(Math.floor(Math.random() * 10_000)),
        insertedAt: '2020-11-28T07:19:17',
        updatedAt: '2020-11-28T07:19:17',
        content: 'Hallo',
        user: from,
        files: [],
      },
      {
        __typename: 'Message',
        id: String(Math.floor(Math.random() * 10_000)),
        insertedAt: '2020-11-28T07:00:09',
        updatedAt: '2020-11-28T07:00:09',
        content: 'Hallo Welt!',
        user: from,
        files: [],
      },
    ],
  };
};
