import gql from 'graphql-tag';

export const RegisterMutation = gql`
    mutation Register($user: RegisterUserParams!, $groupKey: String) {
        register(user: $user, groupKey: $groupKey) {
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
                hideFullName
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