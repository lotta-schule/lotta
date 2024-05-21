'use client';

import * as React from 'react';
import { ApolloNextAppProvider } from '@apollo/experimental-nextjs-app-support/ssr';
import { createSSRClient } from '../../api/apollo/client-ssr';
import { TenantModel } from 'model';

export type ApolloProviderProps = React.PropsWithChildren<{
  tenant: TenantModel;
}>;

export function ApolloProvider({ children, tenant }: ApolloProviderProps) {
  return (
    <ApolloNextAppProvider makeClient={() => createSSRClient(tenant)}>
      {children}
    </ApolloNextAppProvider>
  );
}
