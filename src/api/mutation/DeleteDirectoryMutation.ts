import gql from 'graphql-tag';

export const DeleteDirectoryMutation = gql`
    mutation DeleteDirectory($id: ID!) {
        directory: deleteDirectory(id: $id) {
            id
            parentDirectory {
                id
                name
            }
        }
    }
`;