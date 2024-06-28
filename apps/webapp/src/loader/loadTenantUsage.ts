import { cache } from 'react';
import { TenantUsageModel } from 'model';
import { getClient } from 'api/client';

import GetUsageQuery from 'api/query/GetUsageQuery.graphql';

export const loadTenantUsage = cache(async () => {
  return await getClient()
    .query<{ usage: TenantUsageModel[] }>({
      query: GetUsageQuery,
    })
    .then(({ data }) => {
      return data?.usage ?? [];
    });
});
