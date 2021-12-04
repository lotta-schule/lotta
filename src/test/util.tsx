import * as React from 'react';
import { pick } from 'lodash';
import { ThemeProvider } from '@material-ui/styles';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import { render, RenderOptions } from '@testing-library/react';
import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { de } from 'date-fns/locale';
import { UploadQueueProvider } from 'shared/fileExplorer/context/UploadQueueContext';
import { I18nextProvider } from 'react-i18next';
import { CloudimageProvider } from 'react-cloudimage-responsive';
import { theme } from '../theme';
import {
    ApolloMocksOptions,
    getDefaultApolloMocks,
} from 'test/mocks/defaultApolloMocks';
import { i18n } from '../i18n';
import {
    reducer as fileExplorerStateReducer,
    Action as FileExploreerStateAction,
} from 'shared/fileExplorer/context/reducer';
import { createTheme } from '@material-ui/core';
import fileExplorerContext, {
    defaultState as defaultFileExplorerState,
} from 'shared/fileExplorer/context/FileExplorerContext';
import DateFnsUtils from '@date-io/date-fns';
import { createRouter, Router } from 'next/router';
import { RouterContext } from 'next/dist/shared/lib/router-context';
import { OverlayProvider } from '@react-aria/overlays';

export type TestSetupOptions = {
    additionalMocks?: MockedResponse[];
    router?: {
        getInstance?: (router: Router) => void;
        pathname?: string;
        as?: string;
        query?: any;
        initialProps?: any;
        onPush?: Router['push'];
        onReplace?: Router['replace'];
    };
} & ApolloMocksOptions;

const ProviderFactory =
    (options: TestSetupOptions): React.FC =>
    ({ children }) => {
        const { cache, mocks: defaultMocks } = getDefaultApolloMocks(
            pick(options, ['currentUser', 'tenant', 'categories'])
        );

        const testRouter = createRouter(
            options?.router?.pathname ?? '',
            { ...options?.router?.query },
            options?.router?.as ?? '',
            {
                initialProps: { ...options?.router?.initialProps },
                pageLoader: {
                    getPageList: jest.fn(() => []),
                    getDataHref: jest.fn(() => '/'),
                    _isSsg: jest.fn(async () => false),
                    loadPage: jest.fn(async () => null),
                },
                App: jest.fn(),
                Component: jest.fn(),
            } as any
        );
        options?.router?.getInstance?.(testRouter);
        testRouter.push = async (url: any, ...args) => {
            window.history?.replaceState({}, '', url);
            return options?.router?.onPush
                ? options?.router?.onPush(url, ...args)
                : Promise.resolve(true);
        };
        if (options?.router?.onReplace) {
            testRouter.replace = options?.router?.onReplace;
        }

        const testTheme = createTheme({
            ...theme,
            transitions: { create: () => 'none' },
        });
        return (
            <RouterContext.Provider value={testRouter}>
                <ThemeProvider theme={testTheme}>
                    <MuiPickersUtilsProvider utils={DateFnsUtils} locale={de}>
                        <I18nextProvider i18n={i18n}>
                            <CloudimageProvider
                                config={{ token: 'ABCDEF', lazyLoading: false }}
                            >
                                <OverlayProvider>
                                    <MockedProvider
                                        mocks={[
                                            ...defaultMocks,
                                            ...(options.additionalMocks || []),
                                        ]}
                                        addTypename={false}
                                        cache={cache}
                                    >
                                        <UploadQueueProvider>
                                            {children}
                                        </UploadQueueProvider>
                                    </MockedProvider>
                                </OverlayProvider>
                            </CloudimageProvider>
                        </I18nextProvider>
                    </MuiPickersUtilsProvider>
                </ThemeProvider>
            </RouterContext.Provider>
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
};

export interface TestFileExplorerContextProviderProps {
    children: any;
    defaultValue?: Partial<typeof defaultFileExplorerState>;
    onUpdateState?(currentState: typeof defaultFileExplorerState): void;
}
export const TestFileExplorerContextProvider: React.FC<TestFileExplorerContextProviderProps> =
    ({ children, defaultValue, onUpdateState }) => {
        const [state, dispatch] = React.useReducer<
            React.Reducer<
                typeof defaultFileExplorerState,
                FileExploreerStateAction
            >
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
