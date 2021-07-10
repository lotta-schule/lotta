import { gql } from '@apollo/client';

export const ToggleArticlePinMutation = gql`
    mutation ToggleArticlePin($id: ID!) {
        article: toggleArticlePin(id: $id) {
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
                mimeType
                fileType
                filename
                filesize
            }
            contentModules {
                id
                type
                content
                sortKey
                configuration
                files {
                    id
                    mimeType
                    fileType
                    filename
                    filesize
                    fileConversions {
                        id
                        format
                        mimeType
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
                name
            }
        }
    }
`;
