import { gql } from '@apollo/client';

export const CreateCategoryMutation = gql`
    mutation CreateCategory($category: CreateCategoryInput!) {
        category: createCategory(category: $category) {
            id
            title
            sortKey
            isSidenav
            isHomepage
            hideArticlesFromHomepage
            redirect
            layoutName
            bannerImageFile {
                id
                remoteLocation
            }
            groups {
                id
                sortKey
                name
            }
            category {
                id
                title
                hideArticlesFromHomepage
            }
            widgets {
                id
            }
        }
    }
`;
