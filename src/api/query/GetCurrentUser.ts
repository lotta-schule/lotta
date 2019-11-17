import gql from 'graphql-tag';

export const GetCurrentUserQuery = gql`
    query GetCurrentUser {
        currentUser {
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
                isAdminGroup
                tenant {
                    id
                }
            }
        }
    }
`;