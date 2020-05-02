import { gql } from '@apollo/client';

export const UpdateTenantMutation = gql`
    mutation UpdateTenant($tenant: TenantInput) {
        updateTenant(tenant: $tenant) {
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
        }
    }
`;