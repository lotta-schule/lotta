import gql from 'graphql-tag';

export const DeleteCategoryMutation = gql`
    mutation DeleteCategory($id: ID!) {
        category: deleteCategory(id: $id) {
            id
        }
    }
`;