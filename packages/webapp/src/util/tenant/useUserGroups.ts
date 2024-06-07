import { useQuery } from '@apollo/client';
import { UserGroupModel } from 'model/UserGroupModel';

import GetUserGroupsQuery from 'api/query/GetUserGroupsQuery.graphql';

export const useUserGroups = (): UserGroupModel[] => {
  const { data } = useQuery<{ userGroups: UserGroupModel[] }>(
    GetUserGroupsQuery
  );
  const groups =
    [...(data?.userGroups ?? [])].sort((a, b) => a.sortKey - b.sortKey) ?? [];

  return groups;
};
