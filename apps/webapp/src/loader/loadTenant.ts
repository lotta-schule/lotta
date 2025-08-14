import { cache } from 'react';
import { getClient } from '../api/client';
import { GET_TENANT_QUERY } from 'util/tenant';
import { graphql, ResultOf } from 'api/graphql';

export const GET_TENANT_WITH_STATS_QUERY = graphql(`
  query GetTenantWithStats {
    tenant {
      id
      title
      slug
      host
      identifier
      backgroundImageFile {
        id
      }
      logoImageFile {
        id
        formats(category: "LOGO") {
          name
          url
        }
      }
      configuration {
        customTheme
        userMaxStorageConfig
      }
      stats {
        userCount
        articleCount
      }
    }
  }
`);

export type TenantWithStats = NonNullable<
  ResultOf<typeof GET_TENANT_WITH_STATS_QUERY>['tenant']
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

export const loadTenant = cache(
  async ({ includeStats = false }: LoadTenantParams = {}) => {
    const client = await getClient();
    return await client
      .query({
        query: includeStats ? GET_TENANT_WITH_STATS_QUERY : GET_TENANT_QUERY,
      })
      .then(({ data }) => {
        if (!data?.tenant) {
          throw new TenantNotFoundError();
        }
        return data.tenant;
      });
  }
);
