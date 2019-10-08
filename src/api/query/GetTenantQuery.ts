import gql from 'graphql-tag';

export const GetTenantQuery = gql`
    query GetTenant {
        tenant {
            id
            title
            slug
            groups {
                id
                name
                priority
                isAdminGroup
            }
        }
    }
`;