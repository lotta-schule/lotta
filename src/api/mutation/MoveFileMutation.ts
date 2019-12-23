import gql from 'graphql-tag';

export const MoveFileMutation = gql`
    mutation MoveFile($id: ID!, $path: String, $isPublic: Boolean) {
        file: moveFile(id: $id, path: $path, isPublic: $isPublic) {
            id
            path
            isPublic
        }
    }
`;