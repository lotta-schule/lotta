import gql from 'graphql-tag';

export const GetArticlesQuery = gql`
    query GetArticles($categoryId: ID) {
        articles(categoryId: $categoryId) {
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