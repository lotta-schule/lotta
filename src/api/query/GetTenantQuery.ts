import { gql } from '@apollo/client';

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
            customDomains {
                host
                isMainDomain
            }
        }
    }
`;