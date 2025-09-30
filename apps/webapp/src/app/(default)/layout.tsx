import * as React from 'react';
import { headers } from 'next/headers';
import { loadTenant, loadCategories, loadCurrentUser } from 'loader';
import { appConfig } from 'config';
import { getAuthTokenFromHeader } from 'api/apollo/client-rsc';
import { ApolloProvider } from 'component/provider/ApolloProvider';
import { TenantLayout } from 'layout/TenantLayout';
import { CategoriesProvider } from 'shared/CategoriesContext';
import { CurrentUserProvider } from 'shared/CurrentUserContext';
import { AuthenticationWrapper } from 'shared/AuthenticationWrapper';

export default async function DefaultLayout({
  children,
}: React.PropsWithChildren) {
  const socketUrl = appConfig.get('API_SOCKET_URL');
  const headerValues = await headers();
  const accessToken = getAuthTokenFromHeader(headerValues);

  const tenant = await loadTenant();
  const categories = await loadCategories().catch(() => []);
  const currentUser = await loadCurrentUser().catch(() => null);

  return (
    <ApolloProvider
      tenant={tenant}
      socketUrl={socketUrl}
      accessToken={accessToken ?? undefined}
    >
      <CategoriesProvider categories={categories}>
        <CurrentUserProvider user={currentUser}>
          <AuthenticationWrapper />
          <TenantLayout>{children}</TenantLayout>
        </CurrentUserProvider>
      </CategoriesProvider>
    </ApolloProvider>
  );
}
