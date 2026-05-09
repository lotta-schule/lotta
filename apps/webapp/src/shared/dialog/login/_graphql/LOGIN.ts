import { graphql } from '#/api/graphql.js';

export const LOGIN = graphql(`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      accessToken
    }
  }
`);
