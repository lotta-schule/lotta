import gql from 'graphql-tag';

export const UploadFileMutation = gql`
    mutation UploadFile($path: String, $file: Upload!, $isPublic: Boolean) {
        file: uploadFile(path: $path, file: $file, isPublic: $isPublic) {
            id
            insertedAt
            updatedAt
            path
            isPublic
            filename
            filesize
            mimeType
            remoteLocation
            fileType
            userId
            fileConversions {
                id
            }
        }
    }
`;