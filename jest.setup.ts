import '@jest/globals';
import '@testing-library/jest-dom';
import 'whatwg-fetch';
import { TextEncoder, TextDecoder } from 'util';

self.__NEXT_DATA__ = { ...self.__NEXT_DATA__ } as any;

jest.retryTimes(3);

// create setup document
const dialogContainer = document.createElement('div');
dialogContainer.setAttribute('id', 'dialogContainer');
document.body.appendChild(dialogContainer);

Object.assign(global, { TextDecoder, TextEncoder });

// window.matchMedia mock
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(), // Deprecated
        removeListener: jest.fn(), // Deprecated
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
});

Element.prototype.scroll = jest.fn();
Object.defineProperty(window, 'scrollTo', {
    writable: false,
    value: jest.fn(),
});

jest.mock('next/head', () => {
    const ReactDOMServer = require('react-dom/server');
    return {
        __esModule: true,
        default: ({
            children,
        }: {
            children: Array<React.ReactElement> | React.ReactElement | null;
        }) => {
            if (children) {
                global.document.head.insertAdjacentHTML(
                    'afterbegin',
                    ReactDOMServer.renderToString(children) || ''
                );
            }
            return null;
        },
    };
});
jest.mock('next/config', () => ({
    __esModule: true,
    default: () => ({
        publicRuntimeConfig: {
            appEnvironment: '',
            sentryDsn: '',
            socketUrl: '',
            cloudimageToken: '',
        },
    }),
}));

jest.mock('next/router', () => {
    const mockRouter = new (class {
        private _pathname = '/';
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

        get asPath() {
            return this._pathname;
        }

        events = this._emitter;
    })();
    return {
        __esModule: true,
        mockRouter,
        useRouter: () => mockRouter,
    };
});
