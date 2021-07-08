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
                    remoteLocation
                }
                logoImageFile {
                    id
                    remoteLocation
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
