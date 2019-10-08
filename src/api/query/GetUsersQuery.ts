import gql from 'graphql-tag';

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
            groups {
                id
                name
                isAdminGroup
                tenant {
                    id
                }
            }
            avatarImageFile {
                remoteLocation
            }
        }
    }
`;