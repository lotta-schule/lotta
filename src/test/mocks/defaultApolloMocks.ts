import { TestTenant, allCategories } from 'test/fixtures';
import { GetTenantQuery } from 'api/query/GetTenantQuery';
import { GetCurrentUserQuery } from 'api/query/GetCurrentUser';
import { GetCategoriesQuery } from 'api/query/GetCategoriesQuery';
import { UserModel } from 'model';
import { InMemoryCache } from '@apollo/client';

export interface ApolloMocksOptions {
    currentUser?: UserModel;
}
export const getDefaultApolloMocks = (options: ApolloMocksOptions = {}) => {
    const mocks = [
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
    const cache = new InMemoryCache({ addTypename: false });
    cache.writeQuery({ query: GetTenantQuery,  data: { tenant: TestTenant } });
    if (options.currentUser) {
        cache.writeQuery({ query: GetCurrentUserQuery,  data: { currentUser: options.currentUser } });
    }
    return { cache, mocks };
}
