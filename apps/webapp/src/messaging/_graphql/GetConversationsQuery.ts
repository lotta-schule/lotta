import { graphql } from '#/api/graphql';
import { CONVERSATION_FRAGMENT } from './fragments';

export const GET_CONVERSATIONS_QUERY = graphql(
  `
    query GetConversationsQuery {
      conversations {
        ...ConversationFragment
      }
    }
  `,
  [CONVERSATION_FRAGMENT]
);
