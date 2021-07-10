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
                }
                logoImageFile {
                    id
                }
                customTheme
                userMaxStorageConfig
            }
        }
    }
`;
