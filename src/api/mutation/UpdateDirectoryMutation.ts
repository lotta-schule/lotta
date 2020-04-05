import gql from 'graphql-tag';

export const UpdateDirectoryMutation = gql`
    mutation UpdateDirectory($id: ID!, $name: String, $parentDirectoryId: ID) {
        directory: updateDirectory(id: $id, name: $name, parentDirectoryId: $parentDirectoryId) {
            id
            name
            parentDirectory {
                id
            }
            updatedAt
        }
    }
`;