import { useSuspenseQuery } from '@apollo/client/react';
import { graphql, ResultOf } from 'api/graphql';

export const GET_USER_GROUPS = graphql(`
  query GetUserGroups {
    userGroups {
      id
      name
      isAdminGroup
      sortKey
      canReadFullName
      eduplacesId
    }
  }
`);

export type UserGroup = NonNullable<
  ResultOf<typeof GET_USER_GROUPS>['userGroups']
>[number];

export const useUserGroups = () => {
  const { data } = useSuspenseQuery(GET_USER_GROUPS);

  return data.userGroups;
};
