import { gql } from '@apollo/client';

export const GetOwnArticlesQuery = gql`
    query GetOwnArticles {
        articles: ownArticles {
            id
            insertedAt
            updatedAt
            title
            preview
            tags
            readyToPublish
            published
            isPinnedToTop
            previewImageFile {
                id
                remoteLocation
            }
            contentModules {
                id
                type
                content
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
                title
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
