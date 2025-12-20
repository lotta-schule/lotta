'use client';

import * as React from 'react';
import { type Tenant } from 'util/tenant';

const ServerDataContext = React.createContext({
  tenant: null as Tenant | null,
  socketUrl: undefined as string | undefined,
});

export type ServerDataContextProviderProps = React.PropsWithChildren<{
  tenant: Tenant | null;
  socketUrl?: string;
}>;
export const ServerDataContextProvider = ({
  tenant,
  socketUrl,
  children,
}: ServerDataContextProviderProps) => {
  const value = React.useMemo(
    () => ({ tenant, socketUrl }),
    [tenant, socketUrl]
  );

  return (
    <ServerDataContext.Provider value={value}>
      {children}
    </ServerDataContext.Provider>
  );
};

export const useServerData = () => React.use(ServerDataContext);
