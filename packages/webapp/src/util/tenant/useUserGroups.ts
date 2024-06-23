import { useSuspenseQuery } from '@apollo/client';
import { UserGroupModel } from 'model/UserGroupModel';

import GetUserGroupsQuery from 'api/query/GetUserGroupsQuery.graphql';

export const useUserGroups = () => {
  const { data } = useSuspenseQuery<{ userGroups: UserGroupModel[] }>(
    GetUserGroupsQuery
  );

  // TODO: Server's job
  const groups =
    [...(data?.userGroups ?? [])].sort((a, b) => a.sortKey - b.sortKey) ?? [];

  return groups;
};
