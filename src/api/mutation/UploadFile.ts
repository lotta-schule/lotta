import gql from 'graphql-tag';

export const UploadFileMutation = gql`
    mutation UploadFile($path: String, $file: Upload!) {
        file: uploadFile(path: $path, file: $file) {
            id
            insertedAt
            updatedAt
            filename
            filesize
            mimeType
            path
            remoteLocation
            fileType
            fileConversions {
                id
            }
        }
    }
`;