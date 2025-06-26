import { ConversationModel, NewMessageDestination, UserModel } from 'model';
import { User } from './User';

export const Message = {
  getDestinationName(destination: NewMessageDestination) {
    return destination.group?.name ?? User.getNickname(destination.user);
  },
  conversationAsDestination(
    conversation: ConversationModel,
    currentUser: Pick<UserModel, '__typename' | 'id'>
  ) {
    return {
      user: conversation.users.find((u) => u.id !== currentUser?.id),
      group: conversation.groups[0],
    } as NewMessageDestination;
  },
};
