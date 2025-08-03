import { graphql } from 'api/graphql';

export const UPDATE_USER_GROUP = graphql(`
  mutation UpdateUserGroup($id: ID!, $group: UserGroupInput!) {
    group: updateUserGroup(id: $id, group: $group) {
      id
      name
      isAdminGroup
      sortKey
      canReadFullName
      enrollmentTokens
    }
  }
`);
