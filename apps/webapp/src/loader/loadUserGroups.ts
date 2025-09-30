import { cache } from 'react';
import { getClient } from 'api/client';
import { GET_USER_GROUPS } from 'util/tenant/useUserGroups';

export const loadUserGroups = cache(async () => {
  const client = await getClient();
  const results = await client.query({
    query: GET_USER_GROUPS,
  });
  return results.data.userGroups;
});
