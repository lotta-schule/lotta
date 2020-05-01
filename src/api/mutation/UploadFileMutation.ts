import { gql } from '@apollo/client';

export const UploadFileMutation = gql`
    mutation UploadFile($file: Upload!, $parentDirectoryId: ID) {
        file: uploadFile(file: $file, parentDirectoryId: $parentDirectoryId) {
            id
            insertedAt
            updatedAt
            filename
            filesize
            mimeType
            remoteLocation
            fileType
            userId
            parentDirectory {
                id
            }
            fileConversions {
                id
            }
        }
    }
`;