import gql from 'graphql-tag';

export const GetUserQuery = gql`
    query GetUser($id: ID!) {
        user(id: $id) {
            id
            insertedAt
            updatedAt
            name
            nickname
            email
            class
            isBlocked
            enrollmentTokens
            groups {
                id
                name
                isAdminGroup
                tenant {
                    id
                }
            }
            assignedGroups {
                id
                name
            }
            avatarImageFile {
                remoteLocation
            }
        }
    }
`;