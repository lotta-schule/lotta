import { gql } from '@apollo/client';

export const GetUsersQuery = gql`
    query GetUsers {
        users {
            id
            insertedAt
            updatedAt
            name
            nickname
            email
            class
            isBlocked
            lastSeen
            groups {
                id
                name
                isAdminGroup
            }
            avatarImageFile {
                remoteLocation
            }
        }
    }
`;
