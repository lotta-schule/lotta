import * as React from 'react';
import * as Sentry from '@sentry/nextjs';
import { useQuery } from '@apollo/client';
import { UserModel } from 'model';

import GetCurrentUserQuery from 'api/query/GetCurrentUser.graphql';

export const useCurrentUser = () => {
  const { data } = useQuery<{
    currentUser: UserModel | null;
  }>(GetCurrentUserQuery);
  const currentUser = data?.currentUser ?? null;

  React.useEffect(() => {
    if (currentUser) {
      Sentry.setUser({
        id: currentUser.id,
        username: currentUser.nickname ?? currentUser.name,
        email: currentUser.email,
      });
    } else {
      Sentry.configureScope((scope) => scope.setUser(null));
    }
  }, [currentUser]);

  return currentUser;
};
