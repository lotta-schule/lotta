import { gql } from '@apollo/client';

export const CreateArticleMutation = gql`
    mutation CreateArticle($article: ArticleInput) {
        article: createArticle(article: $article) {
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
                content
                sortKey
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