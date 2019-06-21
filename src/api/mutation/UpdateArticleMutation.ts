import gql from 'graphql-tag';

export const UpdateArticleMutation = gql`
    mutation UpdateArticle($id: ID!, $article: UpdateArticleInput) {
        updateArticle(id: $id, article: $article) {
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