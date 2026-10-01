import { graphql } from '#/api/graphql';
import { CONVERSATION_FRAGMENT, MESSAGE_FRAGMENT } from './fragments';

export const GET_CONVERSATION_QUERY = graphql(
  `
    query GetConversationQuery($id: ID!, $filter: MessageFilter) {
      conversation(id: $id) {
        ...ConversationFragment
        messages(filter: $filter) {
          ...MessageFragment
        }
      }
    }
  `,
  [CONVERSATION_FRAGMENT, MESSAGE_FRAGMENT]
);
