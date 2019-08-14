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
            groups {
                id
                name
                priority
                isAdminGroup
            }
        }
    }
`;