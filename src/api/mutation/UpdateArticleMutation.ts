import { gql } from '@apollo/client';

export const UpdateArticleMutation = gql`
    mutation UpdateArticle($id: ID!, $article: ArticleInput) {
        article: updateArticle(id: $id, article: $article) {
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
                    insertedAt
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
