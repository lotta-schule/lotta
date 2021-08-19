import { gql } from '@apollo/client';

export const UpdateTenantMutation = gql`
    mutation UpdateTenant($tenant: TenantInput) {
        tenant: updateTenant(tenant: $tenant) {
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
