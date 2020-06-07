import React, { FC } from 'react';
import { unionBy } from 'lodash';
import { ThemeProvider } from '@material-ui/styles';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import { render, RenderOptions } from '@testing-library/react'
import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { createBrowserHistory } from 'history';
import { Router } from 'react-router-dom';
import { de } from 'date-fns/locale';
import { UploadQueueProvider } from 'component/fileExplorer/context/UploadQueueContext';
import { I18nextProvider } from 'react-i18next';
import { UserModel } from 'model';
import { theme } from '../theme';
import { defaultApolloMocks } from 'test/mocks/defaultApolloMocks';
import { i18n } from 'i18n';
import DateFnsUtils from '@date-io/date-fns';

export interface TestSetupOptions {
    currentUser?: UserModel;
    additionalMocks?: MockedResponse[];
}

const ProviderFactory = (options: TestSetupOptions): FC  => ({ children }) => {
    const mocks = unionBy(
        options.additionalMocks ?? [],
        defaultApolloMocks,
        ({ request: { query } }) => query
    );
    return (
        <ThemeProvider theme={theme}>
            <MuiPickersUtilsProvider utils={DateFnsUtils} locale={de}>
                    <I18nextProvider i18n={i18n}>
                        <MockedProvider mocks={mocks} addTypename={false}>
                            <UploadQueueProvider>
                                <Router history={createBrowserHistory()}>
                                    {children}
                                </Router>
                            </UploadQueueProvider>
                        </MockedProvider>
                    </I18nextProvider>
            </MuiPickersUtilsProvider>
        </ThemeProvider>
    )
}

const customRender = (ui: React.ReactElement, renderOptions: Omit<RenderOptions, 'queries'> = {}, testSetupOptions: TestSetupOptions = {}) =>
    render(ui, { wrapper: ProviderFactory(testSetupOptions), ...renderOptions })

// re-export everything
export * from '@testing-library/react'

export const getMetaTagValue = (metaName: string) => {
    const metas = document.getElementsByTagName("meta");
    for (let i = 0; i < metas.length; i += 1) {
        if ([metas[i].getAttribute("name"), metas[i].getAttribute("property")].includes(metaName)) {
            return metas[i].getAttribute("content");
        }
    }
    return "";
}

// override render method
export { customRender as render }
