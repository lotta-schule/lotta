import gql from 'graphql-tag';

export const MoveFileMutation = gql`
    mutation MoveFile($id: ID!, $path: String, $isPublic: Boolean, $filename: String) {
        file: moveFile(id: $id, path: $path, isPublic: $isPublic, filename: $filename) {
            id
            path
            filename
            isPublic
        }
    }
`;