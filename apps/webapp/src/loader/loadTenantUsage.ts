import { cache } from 'react';
import { getClient } from '#/api/client.js';
import { graphql, ResultOf } from '#/api/graphql.js';

export const GET_USAGE = graphql(`
  query GetUsage {
    usage {
      year
      month

      activeUserCount {
        value
        updatedAt
      }
      totalStorageCount {
        value
        updatedAt
      }
      mediaConversionSeconds {
        value
        updatedAt
      }
    }
  }
`);

export type TenantUsage = NonNullable<ResultOf<typeof GET_USAGE>>['usage'];

export const loadTenantUsage = cache(async () => {
  const client = await getClient();
  return await client
    .query({
      query: GET_USAGE,
    })
    .then(({ data }) => {
      return data?.usage ?? [];
    });
});
