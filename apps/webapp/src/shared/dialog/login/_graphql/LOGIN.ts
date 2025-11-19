import { graphql } from 'api/graphql';

export const LOGIN = graphql(`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      accessToken
    }
  }
`);
