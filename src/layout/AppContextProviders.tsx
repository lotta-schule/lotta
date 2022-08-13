import * as React from 'react';
import { HubertProvider, defaultTheme } from '@lotta-schule/hubert';
import { CategoryModel, TenantModel, UserModel } from 'model';
import { AppHead } from './AppHead';
import { ApolloProvider } from '@apollo/client';
import { I18nextProvider } from 'react-i18next';
import { CloudimageProvider } from 'react-cloudimage-responsive';
import { Authentication } from 'shared/Authentication';
import { UploadQueueProvider } from 'shared/fileExplorer/context/UploadQueueContext';
import { ServerDataContextProvider } from 'shared/ServerDataContext';
import { getApolloClient } from 'api/client';
import { BaseLayout } from './BaseLayout';
import { i18n } from '../i18n';
import PlausibleProvider from 'next-plausible';
import getConfig from 'next/config';

import GetCategoriesQuery from 'api/query/GetCategoriesQuery.graphql';
import GetCurrentUserQuery from 'api/query/GetCurrentUser.graphql';
import GetTenantQuery from 'api/query/GetTenantQuery.graphql';

const {
    publicRuntimeConfig: { cloudimageToken, plausibleEndpoint },
} = getConfig();

export interface AppContextProvidersProps {
    categories: CategoryModel[] | null;
    currentUser: UserModel | null;
    requestBaseUrl: string;
    tenant: TenantModel;
}

export const AppContextProviders: React.FC<AppContextProvidersProps> = ({
    tenant,
    categories,
    currentUser,
    requestBaseUrl,
    children,
}) => {
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
        typeof window === undefined
            ? requestBaseUrl
            : requestBaseUrl ?? window.location.origin;

    return (
        <PlausibleProvider
            selfHosted
            enabled={!!plausibleEndpoint}
            domain={tenant.host}
            customDomain={plausibleEndpoint}
        >
            <ServerDataContextProvider value={{ baseUrl }}>
                <ApolloProvider client={client}>
                    <I18nextProvider i18n={i18n}>
                        <CloudimageProvider
                            config={{
                                token: cloudimageToken,
                            }}
                        >
                            <HubertProvider theme={defaultTheme}>
                                <Authentication />
                                <UploadQueueProvider>
                                    <AppHead />
                                    <BaseLayout>{children}</BaseLayout>
                                </UploadQueueProvider>
                            </HubertProvider>
                        </CloudimageProvider>
                    </I18nextProvider>
                </ApolloProvider>
            </ServerDataContextProvider>
        </PlausibleProvider>
    );
};
