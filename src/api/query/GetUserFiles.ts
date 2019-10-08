import gql from 'graphql-tag';

export const GetUserFilesQuery = gql`
    query GetUserFiles {
        files {
            id
            insertedAt
            updatedAt
            path
            filename
            filesize
            remoteLocation
            mimeType
            fileType
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