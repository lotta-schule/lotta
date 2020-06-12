import React, { Reducer, FC, useReducer, useEffect } from 'react';
import { unionBy, pick } from 'lodash';
import { ThemeProvider } from '@material-ui/styles';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import { render, RenderOptions } from '@testing-library/react'
import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { createMemoryHistory } from 'history';
import { Router } from 'react-router-dom';
import { de } from 'date-fns/locale';
import { UploadQueueProvider } from 'component/fileExplorer/context/UploadQueueContext';
import { I18nextProvider } from 'react-i18next';
import { UserModel } from 'model';
import { theme } from '../theme';
import { getDefaultApolloMocks } from 'test/mocks/defaultApolloMocks';
import { i18n } from 'i18n';
import { reducer as fileExplorerStateReducer, Action as FileExploreerStateAction } from 'component/fileExplorer/context/reducer';
import DateFnsUtils from '@date-io/date-fns';
import fileExplorerContext, { FileExplorerMode, defaultState as defaultFileExplorerState } from 'component/fileExplorer/context/FileExplorerContext';

export interface TestSetupOptions {
    defaultPathEntries?: string[];
    onChangeLocation?: (location: Location) => void;
    currentUser?: UserModel;
    additionalMocks?: MockedResponse[];
}

const ProviderFactory = (options: TestSetupOptions): FC  => ({ children }) => {
    const { cache, mocks: defaultMocks } = getDefaultApolloMocks(pick(options, 'currentUser'));
    const mocks = unionBy(
        options.additionalMocks ?? [],
        defaultMocks,
        ({ request: { query } }) => query
    );
    console.log(mocks.map(mock => JSON.stringify({ queryKind: mock.request.query.kind, variables: mock.request.variables })));
    const history = createMemoryHistory({ initialEntries: options.defaultPathEntries });
    if (options.onChangeLocation) {
        history.listen((...args) => {
            options.onChangeLocation!(...(args as unknown as [any]));
        });
    }
    return (
        <ThemeProvider theme={theme}>
            <MuiPickersUtilsProvider utils={DateFnsUtils} locale={de}>
                    <I18nextProvider i18n={i18n}>
                        <MockedProvider mocks={mocks} addTypename={false}>
                            <UploadQueueProvider>
                                <Router history={history}>
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

export interface TestFileExplorerContextProviderProps {
    children: any,
    defaultValue?: Partial<typeof defaultFileExplorerState>,
    onUpdateState?(currentState: typeof defaultFileExplorerState): void
};
export const TestFileExplorerContextProvider: FC<TestFileExplorerContextProviderProps> = ({ children, defaultValue, onUpdateState }) => {

    const [state, dispatch] = useReducer<Reducer<typeof defaultFileExplorerState, FileExploreerStateAction>>(fileExplorerStateReducer, {
        ...defaultFileExplorerState,
        ...defaultValue,
        mode: FileExplorerMode.ViewAndEdit
    });
    // eslint-disable-next-line
    useEffect(() => { onUpdateState?.(state); }, [state]);
    return (
        <fileExplorerContext.Provider value={[state, dispatch]}>
            {children}
        </fileExplorerContext.Provider>
    );
};

// override render method
export { customRender as render }
