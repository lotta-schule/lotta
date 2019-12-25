import gql from 'graphql-tag';

export const GetUserFilesQuery = gql`
    query GetUserFiles {
        files {
            id
            insertedAt
            updatedAt
            path
            isPublic
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
        }
    }
`;