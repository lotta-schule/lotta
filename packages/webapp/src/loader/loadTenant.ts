import { cache } from 'react';
import { getClient } from '../api/client';
import { TenantModel } from '../model/TenantModel';

import GetTenantQuery from 'api/query/GetTenantQuery.graphql';

export class TenantNotFoundError extends Error {
  name = 'TenantNotFoundError';

  constructor() {
    super('Tenant not found');
  }
}

export const loadTenant = cache(async () => {
  return await getClient()
    .query<{ tenant: TenantModel }>({
      query: GetTenantQuery,
    })
    .then(
      ({ data }) =>
        data?.tenant ||
        (() => {
          throw new TenantNotFoundError();
        })()
    );
});
