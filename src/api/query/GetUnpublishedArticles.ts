import gql from 'graphql-tag';

export const GetUnpublishedArticlesQuery = gql`
    query GetUnpublishedArticles {
        articles: unpublishedArticles {
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
                filename
                filesize
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
            }
            group {
                id
                priority
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