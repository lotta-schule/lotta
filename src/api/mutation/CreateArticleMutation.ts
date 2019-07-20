import gql from 'graphql-tag';

export const CreateArticleMutation = gql`
    mutation CreateArticle($article: ArticleInput) {
        article: createArticle(article: $article) {
            id
            insertedAt
            updatedAt
            title
            preview
            pageName
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
            }
            category {
                id
                title
            }
        }
    }
`;