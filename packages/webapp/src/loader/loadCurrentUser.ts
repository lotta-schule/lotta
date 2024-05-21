import { getClient } from '../api/client';
import { UserModel } from '../model/UserModel';
import { cookies } from 'next/headers';

import GetCurrentUserQuery from 'api/query/GetCurrentUser.graphql';

export const loadCurrentUser = () =>
  getClient()
    .query<{ currentUser: UserModel | null }>({
      query: GetCurrentUserQuery,
    })
    .then(({ data }) => data?.currentUser ?? null);
