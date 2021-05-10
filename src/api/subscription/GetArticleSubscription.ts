import { gql } from '@apollo/client';

export const ArticleIsUpdatedSubscription = gql`
    subscription ArticleIsUpdated($id: ID!) {
        article: articleIsUpdated(id: $id) {
            id
            insertedAt
            updatedAt
            title
            preview
            tags
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
                content
                sortKey
                configuration
                insertedAt
                updatedAt
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
                avatarImageFile {
                    remoteLocation
                }
            }
        }
    }
`;
