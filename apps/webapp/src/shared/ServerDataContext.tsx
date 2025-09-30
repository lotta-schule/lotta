'use client';

import * as React from 'react';
import * as Sentry from '@sentry/nextjs';
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

export const useServerData = () => React.use(ServerDataContext);
