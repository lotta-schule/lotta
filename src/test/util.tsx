import * as React from 'react';
import { pick } from 'lodash';
import { ThemeProvider } from '@material-ui/styles';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import { render, RenderOptions } from '@testing-library/react';
import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { createMemoryHistory, MemoryHistory } from 'history';
import { Router } from 'react-router-dom';
import { de } from 'date-fns/locale';
import { UploadQueueProvider } from 'component/fileExplorer/context/UploadQueueContext';
import { I18nextProvider } from 'react-i18next';
import { CloudimageProvider } from 'react-cloudimage-responsive';
import { TenantModel, UserModel } from 'model';
import { theme } from '../theme';
import { getDefaultApolloMocks } from 'test/mocks/defaultApolloMocks';
import { i18n } from 'i18n';
import {
    reducer as fileExplorerStateReducer,
    Action as FileExploreerStateAction,
} from 'component/fileExplorer/context/reducer';
import { createMuiTheme } from '@material-ui/core';
import fileExplorerContext, {
    defaultState as defaultFileExplorerState,
} from 'component/fileExplorer/context/FileExplorerContext';
import DateFnsUtils from '@date-io/date-fns';

export interface TestSetupOptions {
    defaultPathEntries?: string[];
    getHistory?: (history: MemoryHistory) => void;
    onChangeLocation?: (location: Location) => void;
    currentUser?: UserModel;
    additionalMocks?: MockedResponse[];
    useCache?: boolean;
    tenant?: TenantModel;
}

const ProviderFactory = (options: TestSetupOptions): React.FC => ({
    children,
}) => {
    const { cache, mocks: defaultMocks } = getDefaultApolloMocks(
        pick(options, ['currentUser', 'tenant'])
    );

    const history = createMemoryHistory({
        initialEntries: options.defaultPathEntries || ['/'],
    });
    options?.getHistory?.(history);
    if (options.onChangeLocation) {
        history.listen((...args) => {
            options.onChangeLocation!(...((args as unknown) as [any]));
        });
    }
    const testTheme = createMuiTheme({
        ...theme,
        transitions: { create: () => 'none' },
    });
    return (
        <ThemeProvider theme={testTheme}>
            <MuiPickersUtilsProvider utils={DateFnsUtils} locale={de}>
                <I18nextProvider i18n={i18n}>
                    <CloudimageProvider
                        config={{ token: 'ABCDEF', lazyLoading: false }}
                    >
                        <MockedProvider
                            mocks={[
                                ...defaultMocks,
                                ...(options.additionalMocks || []),
                            ]}
                            addTypename={false}
                            cache={options.useCache ? cache : undefined}
                        >
                            <UploadQueueProvider>
                                <React.Suspense
                                    fallback={
                                        <span data-testid="LazyLoadIndicator">
                                            Lazy Load ES6 Module
                                        </span>
                                    }
                                >
                                    <Router history={history}>
                                        {children}
                                    </Router>
                                </React.Suspense>
                            </UploadQueueProvider>
                        </MockedProvider>
                    </CloudimageProvider>
                </I18nextProvider>
            </MuiPickersUtilsProvider>
        </ThemeProvider>
    );
};

const customRender = (
    ui: React.ReactElement,
    renderOptions: Omit<RenderOptions, 'wrapper'> = {},
    testSetupOptions: TestSetupOptions = {}
) =>
    render(ui, {
        wrapper: ProviderFactory(testSetupOptions),
        ...renderOptions,
    });

// re-export everything
export * from '@testing-library/react';

export const getMetaTagValue = (metaName: string) => {
    const metas = document.getElementsByTagName('meta');
    for (let i = 0; i < metas.length; i += 1) {
        if (
            [
                metas[i].getAttribute('name'),
                metas[i].getAttribute('property'),
            ].includes(metaName)
        ) {
            return metas[i].getAttribute('content');
        }
    }
    return '';
};

export interface TestFileExplorerContextProviderProps {
    children: any;
    defaultValue?: Partial<typeof defaultFileExplorerState>;
    onUpdateState?(currentState: typeof defaultFileExplorerState): void;
}
export const TestFileExplorerContextProvider: React.FC<TestFileExplorerContextProviderProps> = ({
    children,
    defaultValue,
    onUpdateState,
}) => {
    const [state, dispatch] = React.useReducer<
        React.Reducer<typeof defaultFileExplorerState, FileExploreerStateAction>
    >(fileExplorerStateReducer, {
        ...defaultFileExplorerState,
        ...defaultValue,
    });
    React.useEffect(() => {
        onUpdateState?.(state);
        // eslint-disable-next-line
    }, [state]);
    return (
        <fileExplorerContext.Provider value={[state, dispatch]}>
            {children}
        </fileExplorerContext.Provider>
    );
};

// override render method
export { customRender as render };
