'use client';

import * as React from 'react';
import {
  DefaultThemes,
  GlobalStyles,
  HubertProvider,
} from '@lotta-schule/hubert';
import { CategoryModel } from 'model';
import { AppHead } from './AppHead';
import { ApolloProvider } from '@apollo/client';
import { ServerDataContextProvider } from 'shared/ServerDataContext';
import { fonts } from 'styles/fonts';
import { getApolloClient } from 'api/legacyClient';
import { BaseLayout } from './BaseLayout';
import { GET_TENANT_QUERY, Tenant, useTenant } from 'util/tenant';
import { CurrentUser, GET_CURRENT_USER } from 'util/user/useCurrentUser';
import dynamic from 'next/dynamic';

const DynamicAuthentication = dynamic(() => import('shared/Authentication'), {
  ssr: false,
});

import GetCategoriesQuery from 'api/query/GetCategoriesQuery.graphql';

const defaultTheme = DefaultThemes.standard;

export interface AppContextProvidersProps {
  categories: CategoryModel[] | null;
  currentUser: CurrentUser | null;
  tenant: Tenant;
  requestBaseUrl: string;
  socketUrl?: string;
  children?: React.ReactNode;
}

export type TenantContextProvidersProps = {
  children: React.ReactNode;
};

const TenantContextProviders = React.memo(
  ({ children }: TenantContextProvidersProps) => {
    const tenant = useTenant();
    const customTheme = tenant.configuration.customTheme;

    const theme = {
      ...defaultTheme,
      ...(customTheme as any),
    };

    return (
      <HubertProvider>
        <GlobalStyles theme={theme} supportedFonts={fonts} />
        <DynamicAuthentication />
        <AppHead />
        <BaseLayout>{children}</BaseLayout>
      </HubertProvider>
    );
  }
);
TenantContextProviders.displayName = 'TenantContextProviders';

export const AppContextProviders = ({
  tenant,
  categories,
  currentUser,
  socketUrl,
  children,
}: AppContextProvidersProps) => {
  const firstBrowserInit = React.useRef(false);

  const client = getApolloClient({ tenant, socketUrl });

  if (!firstBrowserInit.current) {
    client.writeQuery({
      query: GET_TENANT_QUERY,
      data: { tenant },
    });
    if (categories) {
      client.writeQuery({
        query: GetCategoriesQuery,
        data: { categories },
      });
    }
    if (currentUser) {
      client.writeQuery({
        query: GET_CURRENT_USER,
        data: { currentUser },
      });
    }
    if (typeof window !== 'undefined') {
      const authToken = document.cookie.match(/SignInAccessToken=(.+);?/i)?.[1];
      if (authToken) {
        localStorage.setItem('id', authToken);
      }
    }

    firstBrowserInit.current = true;
  }

  return (
    <ServerDataContextProvider tenant={tenant} socketUrl={socketUrl}>
      <ApolloProvider client={client}>
        <TenantContextProviders>{children}</TenantContextProviders>
      </ApolloProvider>
    </ServerDataContextProvider>
  );
};
