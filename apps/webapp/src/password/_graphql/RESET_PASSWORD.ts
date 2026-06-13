import { graphql } from '#/api/graphql.js';

export const RESET_PASSWORD = graphql(`
  mutation ResetPassword($email: String!, $password: String!, $token: String!) {
    resetPassword(email: $email, password: $password, token: $token) {
      accessToken
    }
  }
`);
