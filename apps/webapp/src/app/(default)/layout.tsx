import * as React from 'react';
import { cookies, headers } from 'next/headers.js';
import { loadTenant, loadCategories, loadCurrentUser } from '#/loader';
import { appConfig } from '#/config';
import { getAuthTokenFromHeader } from '#/api/apollo/client-rsc';
import { ApolloProvider } from '#/component/provider/ApolloProvider';
import { TenantLayout } from '#/layout/TenantLayout';
import { CategoriesProvider } from '#/shared/CategoriesContext';
import { CurrentUserProvider } from '#/shared/CurrentUserContext';
import { AuthenticationWrapper } from '#/shared/AuthenticationWrapper';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const tenant = await loadTenant();

  return {
    title: tenant.title,
  };
}

export default async function DefaultLayout({
  children,
}: React.PropsWithChildren) {
  const socketUrl = appConfig.get('API_SOCKET_URL');
  const headerValues = await headers();
  const cookieValues = await cookies();
  const accessToken = getAuthTokenFromHeader(headerValues, cookieValues);

  const [tenant, categories, currentUser] = await Promise.all([
    loadTenant(),
    loadCategories().catch(() => []),
    loadCurrentUser().catch(() => null),
  ]);

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
