import { graphql } from '#/api/graphql.js';

export const PERMANENTLY_DELETE_USER_ACCOUNT = graphql(`
  mutation DestroyAccount($userId: ID!, $transferFileIds: [ID!]) {
    user: destroyAccount(userId: $userId, transferFileIds: $transferFileIds) {
      id
    }
  }
`);
