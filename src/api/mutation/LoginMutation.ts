import gql from 'graphql-tag';

export const LoginMutation = gql`
    mutation Login($username: String!, $password: String!) {
        login(username: $username, password: $password) {
            token,
            user {
                id
                email
                nickname
                name
            }
        }
    }
`;