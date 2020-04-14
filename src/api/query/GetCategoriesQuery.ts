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
                title
                type
                configuration
                iconImageFile {
                    id
                    remoteLocation
                }
                groups {
                    id
                    sortKey
                    name
                }
            }
        }
    }
`;