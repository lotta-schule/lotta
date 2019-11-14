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
            isPinnedToTop
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
                    filename
                    filesize
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
                hideArticlesFromHomepage
            }
            groups {
                id
                sortKey
                name
            }
            users {
                id
                nickname
                name
            }
        }
    }
`;