import { graphql } from '#/api/graphql';
import { CONVERSATION_FRAGMENT, MESSAGE_FRAGMENT } from './fragments';

export const SEND_MESSAGE_MUTATION = graphql(
  `
    mutation SendMessage($message: MessageInput!) {
      message: createMessage(message: $message) {
        ...MessageFragment
        conversation {
          ...ConversationFragment
        }
      }
    }
  `,
  [MESSAGE_FRAGMENT, CONVERSATION_FRAGMENT]
);
