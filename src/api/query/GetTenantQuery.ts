import gql from 'graphql-tag';

export const GetTenantQuery = gql`
    query GetTenant {
        tenant {
            id
            title
            slug
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
            groups {
                id
                name
                priority
                isAdminGroup
            }
        }
    }
`;