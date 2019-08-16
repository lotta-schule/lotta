import gql from 'graphql-tag';

export const GetCategoriesQuery = gql`
    query categories {
        categories {
            id
            title
            sortKey
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
                hideArticlesFromHomepage
            }
        }
    }
`;