import gql from 'graphql-tag';

export const MoveFileMutation = gql`
    mutation MoveFile($id: ID!, $path: String!) {
        file: moveFile(id: $id, path: $path) {
            id
            path
        }
    }
`;