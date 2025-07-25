import { tenant, allCategories, userGroups } from 'test/fixtures';
import { CategoryModel, UserGroupModel } from 'model';
import { InMemoryCache } from '@apollo/client';
import { identity } from 'lodash';
import { GET_TENANT_QUERY, Tenant } from 'util/tenant';
import { GET_CURRENT_USER, CurrentUser } from 'util/user/useCurrentUser';

import GetCategoriesQuery from 'api/query/GetCategoriesQuery.graphql';
import GetTagsQuery from 'api/query/GetTagsQuery.graphql';
import GetUserGroupsQuery from 'api/query/GetUserGroupsQuery.graphql';
import ReceiveMessageSubscription from 'api/subscription/ReceiveMessageSubscription.graphql';

export interface ApolloMocksOptions {
  currentUser?: CurrentUser;
  tenant?: Tenant;
  userGroups?: UserGroupModel[];
  tags?: string[];
  categories?: (categories: CategoryModel[]) => CategoryModel[];
  withCache?: (cache: InMemoryCache) => InMemoryCache;
}
export const getDefaultApolloMocks = (options: ApolloMocksOptions = {}) => {
  const withCache = options.withCache || ((cache: InMemoryCache) => cache);
  const mocks = [
    {
      request: { query: GET_TENANT_QUERY },
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
      request: { query: GET_CURRENT_USER },
      result: { data: { currentUser: options.currentUser ?? null } },
    },
    {
      request: { query: GetTagsQuery },
      result: {
        data: {
          tags: [...(options.tags || [])],
        },
      },
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
    query: GET_TENANT_QUERY,
    data: { tenant: options.tenant ?? tenant },
  });
  cache.writeQuery({
    query: GetUserGroupsQuery,
    data: { userGroups: options.userGroups ?? userGroups },
  });
  if (options.currentUser) {
    cache.writeQuery({
      query: GET_CURRENT_USER,
      data: { currentUser: options.currentUser },
    });
  }
  return { cache: withCache(cache), mocks };
};
