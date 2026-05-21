import { cache } from 'react';
import { getClient } from '../api/client';
import { GET_TENANT_QUERY, TENANT_COMMON_FIELDS, Tenant } from 'util/tenant';
import { graphql, ResultOf } from 'api/graphql';

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

export class TenantNotFoundError extends Error {
  name = 'TenantNotFoundError';

  constructor() {
    super('Tenant not found');
  }
}

const loadTenantInternal = cache(
  async (includeStats: boolean): Promise<Tenant | TenantWithStats> => {
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

export function loadTenant(params: {
  includeStats: true;
}): Promise<TenantWithStats>;
export function loadTenant(params?: {
  includeStats?: false | boolean;
}): Promise<Tenant>;
export function loadTenant(
  params: { includeStats?: boolean } = {}
): Promise<Tenant | TenantWithStats> {
  return loadTenantInternal(params.includeStats ?? false);
}
