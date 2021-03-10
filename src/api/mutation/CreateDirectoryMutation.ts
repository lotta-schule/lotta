import { gql } from '@apollo/client';

export const CreateDirectoryMutation = gql`
    mutation CreateDirectory(
        $name: String!
        $parentDirectoryId: ID
        $isPublic: Boolean
    ) {
        directory: CreateDirectory(
            name: $name
            parentDirectoryId: $parentDirectoryId
            isPublic: $isPublic
        ) {
            id
            insertedAt
            updatedAt
            name
            user {
                id
            }
            parentDirectory {
                id
            }
        }
    }
`;
