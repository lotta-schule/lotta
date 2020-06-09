import { TestTenant, allCategories } from 'test/fixtures';
import { GetTenantQuery } from 'api/query/GetTenantQuery';
import { GetCurrentUserQuery } from 'api/query/GetCurrentUser';
import { GetCategoriesQuery } from 'api/query/GetCategoriesQuery';
import { UserModel } from 'model';

export interface ApolloMocksOptions {
    currentUser?: UserModel;
}
export const getDefaultApolloMocks = (options: ApolloMocksOptions = {}) => [
    {
        request: { query: GetTenantQuery },
        result: { data: { tenant: TestTenant } }
    },
    {
        request: { query: GetCurrentUserQuery },
        result: { data: { currentUser: options.currentUser ?? null } }
    },
    {
        request: { query: GetCategoriesQuery, },
        result: { data: { categories: allCategories } }
    }
];
