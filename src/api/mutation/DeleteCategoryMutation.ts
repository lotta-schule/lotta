import { gql } from '@apollo/client';

export const DeleteCategoryMutation = gql`
    mutation DeleteCategory($id: ID!) {
        category: deleteCategory(id: $id) {
            id
        }
    }
`;
