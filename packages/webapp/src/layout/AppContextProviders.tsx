import * as React from 'react';
import {
  DefaultThemes,
  GlobalStyles,
  HubertProvider,
} from '@lotta-schule/hubert';
import { CategoryModel, TenantModel, UserModel } from 'model';
import { AppHead } from './AppHead';
import { ApolloProvider } from '@apollo/client';
import { Authentication } from 'shared/Authentication';
import { ServerDataContextProvider } from 'shared/ServerDataContext';
import { fonts } from 'app/admin/system/presentation/fonts';
import { useTenant } from 'util/tenant/useTenant';
import { getApolloClient } from 'api/legacyClient';
import { BaseLayout } from './BaseLayout';

import GetCategoriesQuery from 'api/query/GetCategoriesQuery.graphql';
import GetCurrentUserQuery from 'api/query/GetCurrentUser.graphql';
import GetTenantQuery from 'api/query/GetTenantQuery.graphql';

const defaultTheme = DefaultThemes.standard;

export interface AppContextProvidersProps {
  categories: CategoryModel[] | null;
  currentUser: UserModel | null;
  requestBaseUrl: string;
  tenant: TenantModel;
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
      ...customTheme,
    };

    return (
      <HubertProvider>
        <GlobalStyles theme={theme} supportedFonts={fonts} />
        <Authentication />
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
  requestBaseUrl,
  children,
}: AppContextProvidersProps) => {
  const firstBrowserInit = React.useRef(false);

  const client = getApolloClient({ tenant });
  if (!firstBrowserInit.current) {
    client.writeQuery({
      query: GetTenantQuery,
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
        query: GetCurrentUserQuery,
        data: { currentUser },
      });
    }
    if (typeof window !== 'undefined') {
      const authToken = document.cookie.match(/AuthToken=(.+);?/i)?.[1];
      if (authToken) {
        localStorage.setItem('id', authToken);
      }
    }
    firstBrowserInit.current = true;
  }

  const baseUrl =
    typeof window === 'undefined'
      ? requestBaseUrl
      : requestBaseUrl ?? window.location.origin;

  return (
    <ServerDataContextProvider baseUrl={baseUrl}>
      <ApolloProvider client={client}>
        <TenantContextProviders>{children}</TenantContextProviders>
      </ApolloProvider>
    </ServerDataContextProvider>
  );
};
