import * as React from 'react';
import { pick } from 'lodash';
import { HubertProvider } from '@lotta-schule/hubert';
import { DefaultThemes } from '@lotta-schule/theme';
import { render, RenderOptions } from '@testing-library/react';
import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { UploadQueueProvider } from 'shared/fileExplorer/context/UploadQueueContext';
import { I18nextProvider } from 'react-i18next';
import {
    ApolloMocksOptions,
    getDefaultApolloMocks,
} from 'test/mocks/defaultApolloMocks';
import { i18n } from '../i18n';
import {
    reducer as fileExplorerStateReducer,
    Action as FileExploreerStateAction,
} from 'shared/fileExplorer/context/reducer';
import fileExplorerContext, {
    defaultState as defaultFileExplorerState,
} from 'shared/fileExplorer/context/FileExplorerContext';
import { createRouter, Router } from 'next/router';
import { RouterContext } from 'next/dist/shared/lib/router-context';

const defaultTheme = DefaultThemes.standard;

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

const ProviderFactory = (options: TestSetupOptions): React.FC => {
    const ComponentClass = ({ children }: { children?: React.ReactNode }) => {
        const { cache, mocks: defaultMocks } = getDefaultApolloMocks(
            pick(options, ['currentUser', 'tenant', 'categories', 'userGroups'])
        );

        const testRouter = createRouter(
            options?.router?.pathname ?? '',
            { ...options?.router?.query },
            options?.router?.as ?? '',
            {
                initialProps: { ...options?.router?.initialProps },
                pageLoader: {
                    getPageList: jest.fn(() => []),
                    getMiddlewareList: jest.fn(() => []),
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

        return (
            <RouterContext.Provider value={testRouter}>
                <I18nextProvider i18n={i18n}>
                    <HubertProvider>
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
                    </HubertProvider>
                </I18nextProvider>
            </RouterContext.Provider>
        );
    };

    return ComponentClass;
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
export const TestFileExplorerContextProvider: React.FC<
    TestFileExplorerContextProviderProps
> = ({ children, defaultValue, onUpdateState }) => {
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
