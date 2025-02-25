import { cache } from 'react';
import { getClient } from 'api/client';
import { GET_CURRENT_USER } from 'util/user/useCurrentUser';

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
      .query({
        query: GET_CURRENT_USER,
      })
      .then(({ data }) => {
        const user = data?.currentUser ?? null;

        if (!user && forceAuthenticated) {
          throw new UnauthenticatedError();
        }

        return user;
      })
);
