import gql from 'graphql-tag';

export const DeleteFileMutation = gql`
    mutation DeleteFile($id: ID!) {
        file: deleteFile(id: $id) {
            id
        }
    }
`;