import gql from 'graphql-tag';

export const GetOwnArticlesQuery = gql`
    query GetOwnArticles {
        articles: ownArticles {
            id
            insertedAt
            updatedAt
            title
            preview
            topic
            readyToPublish
            previewImageFile {
                id
                remoteLocation
                mimeType
                fileType
            }
            contentModules {
                id
                type
                text
                sortKey
                configuration
                files {
                    id
                    remoteLocation
                    mimeType
                    fileType
                    fileConversions {
                        id
                        format
                        mimeType
                        remoteLocation
                    }
                }
            }
            category {
                id
                title
            }
            users {
                id
                nickname
            }
        }
    }
`;