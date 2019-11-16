import gql from 'graphql-tag';

export const GetTenantQuery = gql`
    query GetTenant {
        tenant {
            id
            title
            slug
            customTheme
            logoImageFile {
                id
                remoteLocation
            }
            backgroundImageFile {
                id
                remoteLocation
            }
            groups {
                id
                name
                sortKey
                isAdminGroup
            }
        }
    }
`;