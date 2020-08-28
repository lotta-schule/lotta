import { gql } from '@apollo/client';

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
            enrollmentTokens
            avatarImageFile {
                remoteLocation
            }
            groups {
                id
                name
                isAdminGroup
            }
        }
    }
`;
