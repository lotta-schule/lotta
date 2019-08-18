import gql from 'graphql-tag';

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
                text
                sortKey
            }
            category {
                id
                title
            }
            users {
                id
                nickname
                name
            }
        }
    }
`;