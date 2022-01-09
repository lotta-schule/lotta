import { tenant, allCategories, userGroups } from 'test/fixtures';
import { CategoryModel, TenantModel, UserGroupModel, UserModel } from 'model';
import { InMemoryCache } from '@apollo/client';
import { identity } from 'lodash';

import GetCategoriesQuery from 'api/query/GetCategoriesQuery.graphql';
import GetCurrentUserQuery from 'api/query/GetCurrentUser.graphql';
import GetTenantQuery from 'api/query/GetTenantQuery.graphql';
import GetUserGroupsQuery from 'api/query/GetUserGroupsQuery.graphql';
import ReceiveMessageSubscription from 'api/subscription/ReceiveMessageSubscription.graphql';

export interface ApolloMocksOptions {
    currentUser?: UserModel;
    tenant?: TenantModel;
    userGroups?: UserGroupModel[];
    categories?: (categories: CategoryModel[]) => CategoryModel[];
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
            request: { query: GetUserGroupsQuery },
            result: {
                data: {
                    userGroups: [...(options.userGroups || userGroups || [])],
                },
            },
        },
        {
            request: { query: GetCurrentUserQuery },
            result: { data: { currentUser: options.currentUser ?? null } },
        },
        {
            request: { query: GetCategoriesQuery },
            result: {
                data: {
                    categories: (options.categories ?? identity)(allCategories),
                },
            },
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
    cache.writeQuery({
        query: GetUserGroupsQuery,
        data: { userGroups: options.userGroups ?? userGroups },
    });
    if (options.currentUser) {
        cache.writeQuery({
            query: GetCurrentUserQuery,
            data: { currentUser: options.currentUser },
        });
    }
    return { cache, mocks };
};
