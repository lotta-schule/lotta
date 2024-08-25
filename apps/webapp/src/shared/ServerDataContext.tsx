'use client';

import * as React from 'react';
import { TenantModel } from 'model';

const ServerDataContext = React.createContext({
  baseUrl: null! as string,
  tenant: null as TenantModel | null,
});

export type ServerDataContextProviderProps = React.PropsWithChildren<{
  baseUrl: string;
  tenant: TenantModel | null;
}>;
export const ServerDataContextProvider = ({
  baseUrl,
  tenant,
  children,
}: ServerDataContextProviderProps) => {
  const value = React.useMemo(() => ({ baseUrl, tenant }), [baseUrl, tenant]);
  return (
    <ServerDataContext.Provider value={value}>
      {children}
    </ServerDataContext.Provider>
  );
};

export const useServerData = () => React.useContext(ServerDataContext);
