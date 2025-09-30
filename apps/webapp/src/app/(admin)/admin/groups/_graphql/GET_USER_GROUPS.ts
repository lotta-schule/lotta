import { graphql, ResultOf } from 'api/graphql';

export const GET_USER_GROUPS = graphql(`
  query GetUserGroups {
    userGroups {
      id
      name
      sortKey
      isAdminGroup
      eduplacesId
      canReadFullName
      enrollmentTokens
    }
  }
`);

export type UserGroup = NonNullable<
  ResultOf<typeof GET_USER_GROUPS>['userGroups']
>[number];
