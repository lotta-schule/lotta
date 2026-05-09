'use client';

import * as React from 'react';
import { CurrentUser } from '#/util/user/useCurrentUser.js';

const CurrentUserContext = React.createContext<CurrentUser | null>(null);

export const CurrentUserProvider = ({
  user,
  children,
}: React.PropsWithChildren<{ user: CurrentUser | null }>) => {
  return (
    <CurrentUserContext.Provider value={user}>
      {children}
    </CurrentUserContext.Provider>
  );
};

export const useCurrentUserFromContext = () =>
  React.useContext(CurrentUserContext);
