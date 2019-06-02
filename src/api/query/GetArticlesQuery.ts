import gql from 'graphql-tag';

export const GetArticlesQuery = gql`
    query GetArticles($categoryId: ID) {
        articles(categoryId: $categoryId) {
            id
            insertedAt
            updatedAt
            title
            preview
            previewImageUrl
            pageName
            category {
                id
                title
            }
        }
    }
`;