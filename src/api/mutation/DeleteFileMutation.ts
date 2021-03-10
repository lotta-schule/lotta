import { gql } from '@apollo/client';

export const DeleteFileMutation = gql`
    mutation DeleteFile($id: ID!) {
        file: deleteFile(id: $id) {
            id
            parentDirectory {
                id
                name
            }
        }
    }
`;
