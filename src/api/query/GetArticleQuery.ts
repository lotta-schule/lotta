import gql from 'graphql-tag';

export const GetArticleQuery = gql`
    query GetArticle($id: ID!) {
        article(id: $id) {
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
            }
            category {
                id
                title
            }
            user {
                id
                nickname
            }
        }
    }
`;