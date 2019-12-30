import gql from 'graphql-tag';

export const MoveDirectoryMutation = gql`
    mutation MoveDirectory($path: String, $isPublic: Boolean, $newPath: String) {
        files: moveDirectory(path: $path, isPublic: $isPublic, newPath: $newPath) {
            id
            path
            filename
            isPublic
        }
    }
`;