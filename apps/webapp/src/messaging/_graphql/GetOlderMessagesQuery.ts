import { graphql } from '#/api/graphql';
import { MESSAGE_FRAGMENT } from './fragments';

export const GET_OLDER_MESSAGES_QUERY = graphql(
  `
    query GetOlderMessagesQuery($id: ID!, $filter: MessageFilter) {
      conversation(id: $id) {
        id
        messages(filter: $filter) {
          ...MessageFragment
        }
      }
    }
  `,
  [MESSAGE_FRAGMENT]
);
