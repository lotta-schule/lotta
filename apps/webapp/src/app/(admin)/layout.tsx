import * as React from 'react';
import { cookies, headers } from 'next/headers.js';
import { loadTenant } from '#/loader';
import { appConfig } from '#/config';
import { getAuthTokenFromHeader } from '#/api/apollo/client-rsc';
import { ApolloProvider } from '#/component/provider/ApolloProvider';
import { TenantLayout } from '#/layout/TenantLayout';

export default async function AdminLayout({
  children,
}: React.PropsWithChildren) {
  const socketUrl = appConfig.get('API_SOCKET_URL');
  const headerValues = await headers();
  const cookieValues = await cookies();
  const accessToken = getAuthTokenFromHeader(headerValues, cookieValues);
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
