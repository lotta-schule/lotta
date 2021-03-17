import { gql } from '@apollo/client';

export const DeleteArticleMutation = gql`
    mutation DeleteArticle($id: ID!) {
        article: deleteArticle(id: $id) {
            id
        }
    }
`;
