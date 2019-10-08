import gql from 'graphql-tag';

export const UpdateCategoryMutation = gql`
    mutation UpdateCategory($id: ID!, $category: CategoryInput) {
        category: updateCategory(id: $id, category: $category) {
            id
            title
            sortKey
            redirect
            hideArticlesFromHomepage
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
            widgets {
                id
                title
                type
                configuration
                group {
                    id
                    priority
                    name
                }
            }
        }
    }
`;