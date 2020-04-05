import gql from 'graphql-tag';

export const CreateDirectoryMutation = gql`
    mutation CreateDirectory($name: String!, $parentDirectoryId: ID) {
        directory: CreateDirectory(name: $name, parentDirectoryId: $parentDirectoryId) {
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