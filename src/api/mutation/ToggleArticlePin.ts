import gql from 'graphql-tag';

export const ToggleArticlePinMutation = gql`
    mutation ToggleArticlePin($id: ID!) {
        article: toggleArticlePin(id: $id) {
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