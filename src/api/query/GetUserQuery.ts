import { gql } from '@apollo/client';

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
            enrollmentTokens
            groups {
                id
                name
                isAdminGroup
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
