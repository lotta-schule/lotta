import gql from 'graphql-tag';

export const CreateCategoryMutation = gql`
    mutation CreateCategory($category: CategoryInput!) {
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