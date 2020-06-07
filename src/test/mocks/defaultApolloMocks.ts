import { TestTenant, allCategories } from 'test/fixtures';
import { GetTenantQuery } from 'api/query/GetTenantQuery';
import { GetCurrentUserQuery } from 'api/query/GetCurrentUser';
import { GetCategoriesQuery } from 'api/query/GetCategoriesQuery';

export const defaultApolloMocks = [
    {
        request: { query: GetTenantQuery },
        result: { data: { tenant: TestTenant } }
    },
    {
        request: { query: GetCurrentUserQuery },
        result: { data: { user: null } }
    },
    {
        request: { query: GetCategoriesQuery, },
        result: { data: { categories: allCategories } }
    }
];
