import gql from 'graphql-tag';

export const UpdateCategoryMutation = gql`
    mutation UpdateCategory($id: ID!, $category: CategoryInput) {
        category: updateCategory(id: $id, category: $category) {
            id
            title
            sortKey
            redirect
            bannerImageFile {
                id
                remoteLocation
            }
            group {
                id
                priority
                name
            }
            category {
                id
                title
            }
        }
    }
`;