import { cache } from 'react';
import { TenantUsageModel } from 'model';
import { getClient } from 'api/client';

import GetUsageQuery from 'api/query/GetUsageQuery.graphql';

export const loadTenantUsage = cache(async () => {
  const client = await getClient();
  return await client
    .query<{ usage: TenantUsageModel[] }>({
      query: GetUsageQuery,
    })
    .then(({ data }) => {
      return data?.usage ?? [];
    });
});
