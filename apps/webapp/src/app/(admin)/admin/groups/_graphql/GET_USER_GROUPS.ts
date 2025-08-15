import { graphql } from 'api/graphql';

export const GET_USER_GROUPS = graphql(`
  query GetUserGroups {
    userGroups {
      id
      name
      isAdminGroup
      sortKey
      canReadFullName
    }
  }
`);
