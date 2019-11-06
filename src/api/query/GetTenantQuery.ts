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
            groups {
                id
                name
                priority
                isAdminGroup
            }
        }
    }
`;