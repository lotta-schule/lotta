import { graphql } from '#/api/graphql';

export const PERMANENTLY_DELETE_USER_ACCOUNT = graphql(`
  mutation DestroyAccount($userId: ID!, $transferFileIds: [ID!]) {
    user: destroyAccount(userId: $userId, transferFileIds: $transferFileIds) {
      id
    }
  }
`);

export const GET_ARTICLES_WITH_USER_FILES = graphql(`
  query GetArticlesWithUserFiles($userId: ID!) {
    articles: articlesWithUserFiles(userId: $userId) {
      id
      title
    }
  }
`);
