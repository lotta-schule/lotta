import { cache } from 'react';
import { getClient } from '#/api/client';
import { graphql } from '#/api/graphql';

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

export const loadUserGroup = cache(async (id: string) => {
  const client = await getClient();
  // Let gql.tada infer the result from GET_GROUP_QUERY rather than overriding it
  // with the hand-written UserGroupModel.
  return await client
    .query({
      query: GET_GROUP_QUERY,
      variables: { id },
    })
    .then(({ data }) => data?.group ?? null);
});
