import { cache } from 'react';
import { getClient } from 'api/client';
import { UserModel } from 'model';

import GetCurrentUserQuery from 'api/query/GetCurrentUser.graphql';

export class UnauthenticatedError extends Error {
  name = 'UnauthenticatedError';

  constructor() {
    super('User is not authenticated');
  }
}

export type LoadCurrentUserParams = {
  forceAuthenticated?: boolean;
};

export const loadCurrentUser = cache(
  ({ forceAuthenticated = false }: LoadCurrentUserParams = {}) =>
    getClient()
      .query<{ currentUser: UserModel | null }>({
        query: GetCurrentUserQuery,
      })
      .then(({ data }) => {
        const user = data?.currentUser ?? null;

        if (!user && forceAuthenticated) {
          throw new UnauthenticatedError();
        }

        return user;
      })
);
