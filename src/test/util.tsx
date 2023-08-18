import * as React from 'react';
import { pick } from 'lodash';
import { HubertProvider } from '@lotta-schule/hubert';
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

export type TestSetupOptions = {
    additionalMocks?: MockedResponse[];
} & ApolloMocksOptions;

const ProviderFactory = (options: TestSetupOptions): React.FC => {
    const ComponentClass = ({ children }: { children?: React.ReactNode }) => {
        const { cache, mocks: defaultMocks } = getDefaultApolloMocks(
            pick(options, [
                'currentUser',
                'tenant',
                'categories',
                'userGroups',
                'tags',
            ])
        );

        return (
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
                        <UploadQueueProvider>{children}</UploadQueueProvider>
                    </MockedProvider>
                </HubertProvider>
            </I18nextProvider>
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

export class MockRouter {
    private _pathname: string = '/';
    private _emitter = new (class {
        _callbacks = new Map<string, Function[]>();
        _on(event: string, callback: Function) {
            this._callbacks.set(event, [
                ...(this._callbacks.get(event) || []),
                callback,
            ]);
        }
        _off(event: string, callback: Function) {
            if (this._callbacks.has(event)) {
                this._callbacks.set(
                    event,
                    (this._callbacks.get(event) as Function[]).filter(
                        (cb) => cb !== callback
                    )
                );
            }
        }
        _emit(event: string, ...args: any[]) {
            this._callbacks.get(event)?.forEach((cb) => cb(...args));
        }
        clear() {
            this._callbacks.clear();
        }
        on = jest.fn(this._on.bind(this));
        off = jest.fn(this._off.bind(this));
        emit = jest.fn(this._emit.bind(this));
    })();
    private _history = new Set<string>(this._pathname);
    private _push = jest.fn(
        async (_pathname: string, _as = _pathname, _options?: any) => {
            this._pathname = _pathname;
            this._history.add(_pathname);
            window.dispatchEvent(new Event('beforeunload'));
            this._emitter.emit('routeChangeStart', _pathname);
            this._emitter.emit('routeChangeComplete', _pathname);
            this._emitter.emit('routeChangeEnd', _pathname);
            return true;
        }
    );

    reset(pathname = '/') {
        this._emitter.clear();
        this._history.clear();
        this._push.mockReset();
        this._pathname = pathname;
        this._history.add(pathname);
    }

    push(pathname: string, asPath: string = pathname, options?: any) {
        this._push(pathname, asPath, options);
        this._pathname = pathname;
        this._history.add(pathname);
        this._emitter.emit('routeChangeStart', pathname);
        this._emitter.emit('routeChangeComplete', pathname);
        this._emitter.emit('routeChangeEnd', pathname);
    }

    events = this._emitter;
}
