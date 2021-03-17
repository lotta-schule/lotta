import { gql } from '@apollo/client';

export const UpdateArticleMutation = gql`
    mutation UpdateArticle($id: ID!, $article: ArticleInput) {
        article: updateArticle(id: $id, article: $article) {
            id
            insertedAt
            updatedAt
            title
            preview
            topic
            readyToPublish
            published
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
                name
            }
        }
    }
`;
