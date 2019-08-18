import gql from 'graphql-tag';

export const LoginMutation = gql`
    mutation Login($username: String!, $password: String!) {
        login(username: $username, password: $password) {
            token,
            user {
                id
                insertedAt
                updatedAt
                name
                nickname
                email
                class
                groups {
                    id
                    name
                    priority
                    isAdminGroup
                    tenant {
                        id
                    }
                }
            }
        }
    }
`;