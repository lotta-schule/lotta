import { system, allCategories } from 'test/fixtures';
import { GetSystemQuery } from 'api/query/GetSystemQuery';
import { GetCurrentUserQuery } from 'api/query/GetCurrentUser';
import { GetCategoriesQuery } from 'api/query/GetCategoriesQuery';
import { ClientModel, UserModel } from 'model';
import { InMemoryCache } from '@apollo/client';
import { ReceiveMessageSubscription } from 'api/subscription/ReceiveMessageSubscription';

export interface ApolloMocksOptions {
    currentUser?: UserModel;
    system?: ClientModel;
}
export const getDefaultApolloMocks = (options: ApolloMocksOptions = {}) => {
    const mocks = [
        {
            request: { query: GetSystemQuery },
            result: { data: { system: { ...(options.system ?? system), id: 1 } } }
        },
        {
            request: { query: GetCurrentUserQuery },
            result: { data: { currentUser: options.currentUser ?? null } }
        },
        {
            request: { query: GetCategoriesQuery, },
            result: { data: { categories: allCategories } }
        },
        { request: { query: ReceiveMessageSubscription }, result: {}}
    ];
    const cache = new InMemoryCache({
        addTypename: false
    });
    cache.writeQuery({ query: GetSystemQuery,  data: { system: options.system ?? system } });
    if (options.currentUser) {
        cache.writeQuery({ query: GetCurrentUserQuery,  data: { currentUser: options.currentUser } });
    }
    return { cache, mocks };
}
