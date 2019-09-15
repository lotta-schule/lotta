import gql from 'graphql-tag';

export const GetCategoriesQuery = gql`
    query categories {
        categories {
            id
            title
            sortKey
            isSidenav
            hideArticlesFromHomepage
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
                hideArticlesFromHomepage
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