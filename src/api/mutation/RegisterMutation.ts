import gql from 'graphql-tag';

export const RegisterMutation = gql`
    mutation Register($name: String!, $email: String!, $password: String!) {
        register(user: { email: $email, name: $name, password: $password }) {
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