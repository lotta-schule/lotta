import { gql } from '@apollo/client';

export const GetSystemQuery = gql`
    query GetSystem {
        system {
            id
            title
            slug
            host
            customTheme
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
