import { graphql } from '#/api/graphql';
import { CONVERSATION_FRAGMENT, MESSAGE_FRAGMENT } from './fragments';

export const RECEIVE_MESSAGE_SUBSCRIPTION = graphql(
  `
    subscription ReceiveMessage {
      message: receiveMessage {
        ...MessageFragment
        conversation {
          ...ConversationFragment
        }
      }
    }
  `,
  [MESSAGE_FRAGMENT, CONVERSATION_FRAGMENT]
);
