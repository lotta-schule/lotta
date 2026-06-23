import { graphql } from '#/api/graphql';

export const DELETE_MESSAGE_MUTATION = graphql(`
  mutation DeleteMessage($id: ID!) {
    message: deleteMessage(id: $id) {
      id
    }
  }
`);
