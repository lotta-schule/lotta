import { gql } from '@apollo/client';

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
            isPinnedToTop
            previewImageFile {
                id
                remoteLocation
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
                    filename
                    filesize
                    insertedAt
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
            }
            groups {
                id
                sortKey
                name
            }
            users {
                id
                nickname
            }
        }
    }
`;