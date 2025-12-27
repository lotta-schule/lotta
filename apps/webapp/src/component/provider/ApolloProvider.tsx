'use client';

import * as React from 'react';
import { ApolloNextAppProvider } from '@apollo/client-integration-nextjs';
import { createSSRClient } from '../../api/apollo/client-ssr';
import { TenantModel } from 'model';

export type ApolloProviderProps = React.PropsWithChildren<{
  tenant: Pick<TenantModel, 'id'>;
  socketUrl: string;
  accessToken?: string;
}>;

export function ApolloProvider({
  children,
  tenant,
  socketUrl,
  accessToken,
}: ApolloProviderProps) {
  return (
    <ApolloNextAppProvider
      makeClient={() => createSSRClient(tenant, socketUrl, accessToken)}
    >
      {children}
    </ApolloNextAppProvider>
  );
}
