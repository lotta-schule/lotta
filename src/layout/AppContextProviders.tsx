import * as React from 'react';
import { ThemeProvider } from '@material-ui/styles';
import { createTheme } from '@material-ui/core/styles';
import { deDE } from '@material-ui/core/locale';
import { CategoryModel, TenantModel, UserModel } from 'model';
import { theme } from '../theme';
import { AppHead } from './AppHead';
import { ApolloProvider } from '@apollo/client';
import { I18nextProvider } from 'react-i18next';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import { CloudimageProvider } from 'react-cloudimage-responsive';
import { OverlayProvider } from '@react-aria/overlays';
import { Authentication } from 'shared/Authentication';
import { UploadQueueProvider } from 'shared/fileExplorer/context/UploadQueueContext';
import { ServerDataContextProvider } from 'shared/ServerDataContext';
import { getApolloClient } from 'api/client';
import { de } from 'date-fns/locale';
import { i18n } from '../i18n';
import merge from 'lodash/merge';
import DateFnsUtils from '@date-io/date-fns';
import getConfig from 'next/config';

import GetCategoriesQuery from 'api/query/GetCategoriesQuery.graphql';
import GetCurrentUserQuery from 'api/query/GetCurrentUser.graphql';
import GetTenantQuery from 'api/query/GetTenantQuery.graphql';
import { AppBody } from './AppBody';

const {
    publicRuntimeConfig: { cloudimageToken },
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
        <ServerDataContextProvider value={{ baseUrl }}>
            <ApolloProvider client={client}>
                <ThemeProvider theme={theme}>
                    <I18nextProvider i18n={i18n}>
                        <MuiPickersUtilsProvider
                            utils={DateFnsUtils}
                            locale={de}
                        >
                            <CloudimageProvider
                                config={{
                                    token: cloudimageToken,
                                }}
                            >
                                <OverlayProvider>
                                    <Authentication />
                                    <UploadQueueProvider>
                                        <ThemeProvider
                                            theme={() => {
                                                if (
                                                    tenant.configuration
                                                        .customTheme
                                                ) {
                                                    return createTheme(
                                                        merge(
                                                            {},
                                                            theme,
                                                            tenant.configuration
                                                                .customTheme
                                                        ),
                                                        deDE
                                                    );
                                                }
                                                return theme;
                                            }}
                                        >
                                            <AppHead />
                                            <AppBody>{children}</AppBody>
                                        </ThemeProvider>
                                    </UploadQueueProvider>
                                </OverlayProvider>
                            </CloudimageProvider>
                        </MuiPickersUtilsProvider>
                    </I18nextProvider>
                </ThemeProvider>
            </ApolloProvider>
        </ServerDataContextProvider>
    );
};
