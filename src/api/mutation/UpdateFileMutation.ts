import { gql } from '@apollo/client';

export const UpdateFileMutation = gql`
    mutation UpdateFile($id: ID!, $filename: String, $parentDirectoryId: ID) {
        file: updateFile(id: $id, filename: $filename, parentDirectoryId: $parentDirectoryId) {
            id
            filename
            parentDirectory {
                id
            }
            updatedAt
        }
    }
`;