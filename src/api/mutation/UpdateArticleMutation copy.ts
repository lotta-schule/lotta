import gql from 'graphql-tag';

export const DeleteArticleMutation = gql`
    mutation DeleteArticle($id: ID!) {
        article: deleteArticle(id: $id) {
            id
        }
    }
`;