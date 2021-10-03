import { tenant, allCategories } from 'test/fixtures';
import { TenantModel, UserModel } from 'model';
import { InMemoryCache } from '@apollo/client';
import ReceiveMessageSubscription from 'api/subscription/ReceiveMessageSubscription.graphql';
import GetCategoriesQuery from 'api/query/GetCategoriesQuery.graphql';
import GetCurrentUserQuery from 'api/query/GetCurrentUser.graphql';
import GetTenantQuery from 'api/query/GetTenantQuery.graphql';

export interface ApolloMocksOptions {
    currentUser?: UserModel;
    tenant?: TenantModel;
}
export const getDefaultApolloMocks = (options: ApolloMocksOptions = {}) => {
    const mocks = [
        {
            request: { query: GetTenantQuery },
            result: {
                data: { tenant: { ...(options.tenant ?? tenant), id: 1 } },
            },
        },
        {
            request: { query: GetCurrentUserQuery },
            result: { data: { currentUser: options.currentUser ?? null } },
        },
        {
            request: { query: GetCategoriesQuery },
            result: { data: { categories: allCategories } },
        },
        {
            request: { query: ReceiveMessageSubscription },
            result: {},
        },
    ];
    const cache = new InMemoryCache({
        addTypename: false,
    });
    cache.writeQuery({
        query: GetTenantQuery,
        data: { tenant: options.tenant ?? tenant },
    });
    if (options.currentUser) {
        cache.writeQuery({
            query: GetCurrentUserQuery,
            data: { currentUser: options.currentUser },
        });
    }
    return { cache, mocks };
};
