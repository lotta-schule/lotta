import gql from 'graphql-tag';

export const RegisterMutation = gql`
    mutation Register($name: String!, $email: String!, $password: String!, $groupKey: String) {
        register(user: { email: $email, name: $name, password: $password }, groupKey: $groupKey) {
            token,
            user {
                id
                insertedAt
                updatedAt
                lastSeen
                name
                nickname
                email
                class
                avatarImageFile {
                    remoteLocation
                }
                groups {
                    id
                    name
                    sortKey
                    isAdminGroup
                    tenant {
                        id
                    }
                }
            }
        }
    }
`;