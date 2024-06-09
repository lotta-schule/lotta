import { cache } from 'react';
import { getClient } from '../api/client';
import { TenantModel } from '../model/TenantModel';

import GetTenantQuery from 'api/query/GetTenantQuery.graphql';
import GetTenantWithStatsQuery from 'api/query/GetTenantWithStatsQuery.graphql';

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
    return await getClient()
      .query<{ tenant: TenantModel }>({
        query: includeStats ? GetTenantWithStatsQuery : GetTenantQuery,
      })
      .then(
        ({ data }) =>
          data?.tenant ||
          (() => {
            throw new TenantNotFoundError();
          })()
      );
  }
);
