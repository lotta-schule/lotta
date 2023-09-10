import { useQuery } from '@apollo/client';
import { UserGroupModel } from 'model/UserGroupModel';
import sortBy from 'lodash/sortBy';

import GetUserGroupsQuery from 'api/query/GetUserGroupsQuery.graphql';

export const useUserGroups = (): UserGroupModel[] => {
  const { data } = useQuery<{ userGroups: UserGroupModel[] }>(
    GetUserGroupsQuery
  );
  return data?.userGroups ? sortBy(data.userGroups, 'sortKey') : [];
};
