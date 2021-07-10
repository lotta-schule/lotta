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
            lastSeen
            groups {
                id
                name
                isAdminGroup
            }
            avatarImageFile {
                id
            }
        }
    }
`;
