import { gql } from '@apollo/client';

export const GetDirectoriesAndFilesQuery = gql`
    query GetDirectoriesAndFiles($parentDirectoryId: ID) {
        directories(parentDirectoryId: $parentDirectoryId) {
            id
            insertedAt
            updatedAt
            name
            user {
                id
            }
            parentDirectory {
                id
            }
        }
        files(parentDirectoryId: $parentDirectoryId) {
            id
            insertedAt
            updatedAt
            filename
            filesize
            remoteLocation
            mimeType
            fileType
            userId
            fileConversions {
                id
                insertedAt
                updatedAt
                format
                mimeType
                remoteLocation
            }
            parentDirectory {
                id
            }
        }
    }
`;