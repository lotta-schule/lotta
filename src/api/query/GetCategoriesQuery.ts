import gql from 'graphql-tag';

export const GetCategoriesQuery = gql`
    query categories {
        categories {
            id
            title
            sortKey
            isSidenav
            isHomepage
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
                iconImageFile {
                    id
                    remoteLocation
                }
                group {
                    id
                    priority
                    name
                }
            }
        }
    }
`;