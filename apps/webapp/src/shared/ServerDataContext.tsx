'use client';

import * as React from 'react';
import * as Sentry from '@sentry/nextjs';
import { Tenant } from 'util/tenant';

const ServerDataContext = React.createContext({
  tenant: null as Tenant | null,
});

export type ServerDataContextProviderProps = React.PropsWithChildren<{
  tenant: Tenant | null;
}>;
export const ServerDataContextProvider = ({
  tenant,
  children,
}: ServerDataContextProviderProps) => {
  const value = React.useMemo(() => ({ tenant }), [tenant]);

  React.useEffect(() => {
    Sentry.setContext('tenant', tenant as any);
    Sentry.setTags({ 'tenant.slug': tenant?.slug, 'tenant.id': tenant?.id });
  }, [tenant]);

  return (
    <ServerDataContext.Provider value={value}>
      {children}
    </ServerDataContext.Provider>
  );
};

export const useServerData = () => React.useContext(ServerDataContext);
