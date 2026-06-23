import { FragmentOf } from '#/api/graphql';
import { UserGroupModel, UserModel } from '#/model';
import { User } from '#/util/model';
import { CONVERSATION_FRAGMENT } from './_graphql/fragments';

export type NewMessageDestination =
  | { group: UserGroupModel; user?: never }
  | { user: UserModel; group?: never };

export const Message = {
  getDestinationName(destination: NewMessageDestination) {
    return destination.group?.name ?? User.getNickname(destination.user);
  },
  conversationAsDestination(
    conversation: FragmentOf<typeof CONVERSATION_FRAGMENT>,
    currentUser: Pick<UserModel, '__typename' | 'id'>
  ) {
    return {
      user: (conversation.users ?? []).find((u) => u.id !== currentUser?.id),
      group: conversation.groups?.[0],
    } as NewMessageDestination;
  },
};
