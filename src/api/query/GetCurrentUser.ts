import gql from 'graphql-tag';

export const GetCurrentUserQuery = gql`
    query GetCurrentUser {
        currentUser {
            id
            insertedAt
            updatedAt
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
                isAdminGroup
                tenant {
                    id
                }
            }
        }
    }
`;