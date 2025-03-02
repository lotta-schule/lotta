import { cache } from 'react';
import { getClient } from 'api/client';
import { UserGroupModel } from 'model';

import GetGroupQuery from 'api/query/GetGroupQuery.graphql';

export const loadUserGroup = cache(async (id: UserGroupModel['id']) => {
  const client = await getClient();
  const group = await client
    .query<{ group: UserGroupModel }>({
      query: GetGroupQuery,
      variables: { id },
    })
    .then(({ data }) => data?.group ?? null);

  return group;
});
