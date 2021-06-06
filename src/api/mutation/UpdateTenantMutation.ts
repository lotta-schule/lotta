import { gql } from '@apollo/client';

export const UpdateTenantMutation = gql`
    mutation UpdateTenant($tenant: TenantInput) {
        updateTenant(tenant: $tenant) {
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
        }
    }
`;
