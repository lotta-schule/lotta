import { gql } from '@apollo/client';

export const UpdateCategoryMutation = gql`
    mutation UpdateCategory($id: ID!, $category: UpdateCategoryInput) {
        category: updateCategory(id: $id, category: $category) {
            id
            title
            sortKey
            redirect
            hideArticlesFromHomepage
            layoutName
            bannerImageFile {
                id
            }
            groups {
                id
                sortKey
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
                groups {
                    id
                    sortKey
                    name
                }
            }
        }
    }
`;
