import gql from 'graphql-tag';

export const CreateArticleMutation = gql`
    mutation CreateArticle($article: CreateArticleInput) {
        article: createArticle(article: $article) {
            id
            insertedAt
            updatedAt
            title
            preview
            previewImageUrl
            pageName
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