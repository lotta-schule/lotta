import { cache } from 'react';
import { getClient } from 'api/client';
import { graphql } from 'api/graphql';
import { UserGroupModel } from 'model';

export const GET_GROUP_QUERY = graphql(`
  query GetGroup($id: ID!) {
    group(id: $id) {
      id
      name
      isAdminGroup
      sortKey
      eduplacesId
      enrollmentTokens
      canReadFullName
    }
  }
`);

export const loadUserGroup = cache(async (id: UserGroupModel['id']) => {
  const client = await getClient();
  return await client
    .query<{ group: UserGroupModel }>({
      query: GET_GROUP_QUERY,
      variables: { id },
    })
    .then(({ data }) => data?.group ?? null);
});
