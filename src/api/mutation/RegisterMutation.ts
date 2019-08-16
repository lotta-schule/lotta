import gql from 'graphql-tag';

export const RegisterMutation = gql`
    mutation Register($name: String!, $email: String!, $password: String!, $groupKey: String) {
        register(user: { email: $email, name: $name, password: $password }, groupKey: $groupKey) {
            token,
            user {
                id
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