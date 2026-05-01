import * as React from 'react';
import { headers } from 'next/headers';
import { loadTenant } from '#/loader/index.js';
import { appConfig } from '#/config.js';
import { getAuthTokenFromHeader } from '#/api/apollo/client-rsc.js';
import { ApolloProvider } from '#/component/provider/ApolloProvider.js';
import { TenantLayout } from '#/layout/TenantLayout.js';

export default async function AdminLayout({
  children,
}: React.PropsWithChildren) {
  const socketUrl = appConfig.get('API_SOCKET_URL');
  const headerValues = await headers();
  const accessToken = getAuthTokenFromHeader(headerValues);
  const tenant = await loadTenant();

  return (
    <ApolloProvider
      tenant={tenant}
      socketUrl={socketUrl}
      accessToken={accessToken ?? undefined}
    >
      <TenantLayout fullSizeScrollable>{children}</TenantLayout>
    </ApolloProvider>
  );
}
