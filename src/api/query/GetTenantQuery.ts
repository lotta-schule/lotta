import { gql } from '@apollo/client';

export const GetTenantQuery = gql`
    query GetTenant {
        tenant {
            id
            title
            slug
            host
            configuration {
                backgroundImageFile {
                    id
                }
                logoImageFile {
                    id
                }
                customTheme
                userMaxStorageConfig
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
