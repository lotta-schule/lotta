'use client';

import React from 'react';
import { type Tenant } from '#/util/tenant';

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
  return (
    <ServerDataContext.Provider value={{ socketUrl, tenant }}>
      {children}
    </ServerDataContext.Provider>
  );
};

export const useServerData = () => React.use(ServerDataContext);
