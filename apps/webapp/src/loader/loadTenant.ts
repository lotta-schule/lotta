import { cache } from 'react';
import { getClient } from '../api/client.js';
import { GET_TENANT_QUERY, TENANT_COMMON_FIELDS } from '#/util/tenant/index.js';
import { graphql, ResultOf } from '#/api/graphql.js';

export const GET_TENANT_WITH_STATS_QUERY = graphql(
  `
    query GetTenantWithStats {
      tenant {
        ...TenantCommonFields
        stats {
          userCount
          articleCount
        }
      }
    }
  `,
  [TENANT_COMMON_FIELDS]
);

export type TenantWithStats = NonNullable<
  ResultOf<typeof GET_TENANT_WITH_STATS_QUERY>['tenant']
>;

export type TenantWithoutStats = NonNullable<
  ResultOf<typeof GET_TENANT_QUERY>['tenant']
>;

export class TenantNotFoundError extends Error {
  name = 'TenantNotFoundError';

  constructor() {
    super('Tenant not found');
  }
}

export type LoadTenantParams = {
  includeStats?: boolean;
};

const loadTenantImpl = cache(
  async ({ includeStats = false }: LoadTenantParams = {}) => {
    const client = await getClient();
    return await client
      .query({
        query: includeStats ? GET_TENANT_WITH_STATS_QUERY : GET_TENANT_QUERY,
      })
      .then(({ data }) => {
        const tenant = data?.tenant;
        if (!tenant) {
          throw new TenantNotFoundError();
        }
        return tenant;
      });
  }
);

// Overloads so the return type reflects `includeStats` (the runtime picks the query).
export function loadTenant(
  params: LoadTenantParams & { includeStats: true }
): Promise<TenantWithStats>;
export function loadTenant(
  params?: LoadTenantParams
): Promise<TenantWithoutStats>;
export function loadTenant(params: LoadTenantParams = {}) {
  return loadTenantImpl(params);
}
