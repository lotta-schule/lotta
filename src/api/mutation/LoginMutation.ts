import { gql } from '@apollo/client';

export const LoginMutation = gql`
    mutation Login($username: String!, $password: String!) {
        login(username: $username, password: $password) {
            accessToken
        }
    }
`;
